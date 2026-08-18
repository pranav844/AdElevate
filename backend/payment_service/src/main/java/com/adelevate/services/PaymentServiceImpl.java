package com.adelevate.services;

import com.adelevate.clients.AdServiceClient;
import com.adelevate.dtos.AdSyncDto;
import com.adelevate.dtos.PaymentRequestDto;
import com.adelevate.dtos.PaymentResponseDto;
import com.adelevate.entities.Payment;
import com.adelevate.enums.PaymentStatus;
import com.adelevate.repositories.PaymentRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final RazorpayClient razorpayClient;
    private final String razorpaySecret; // injected from config
    private final AdServiceClient adServiceClient; // ✅ inject AdServiceClient

    @Override
    public PaymentResponseDto initiatePayment(PaymentRequestDto dto) {
        // ✅ Reuse the row syncAdData already created for this ad, instead of
        // inserting a second Payment row for the same ad.
        Payment payment = paymentRepository.findByAdId(dto.getAdId())
                .stream()
                .findFirst()
                .orElseGet(Payment::new);

        payment.setAdId(dto.getAdId());
        payment.setVendorId(dto.getVendorId());
        payment.setAmount(dto.getAmount());
        payment.setStatus(PaymentStatus.PENDING_PAYMENT);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", dto.getAmount() * 100); // Razorpay expects paise
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "txn_" + dto.getAdId());

            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);

            if (order != null) {
                String razorpayOrderId = order.get("id");
                payment.setOrderId(razorpayOrderId);
                payment.setStatus(PaymentStatus.PENDING_PAYMENT);

                System.out.println("✅ Razorpay Order Created: " + razorpayOrderId);
            } else {
                payment.setStatus(PaymentStatus.FAILED);
                System.out.println("❌ Razorpay Order creation returned null");
            }
        } catch (RazorpayException e) {
            e.printStackTrace();
            payment.setStatus(PaymentStatus.FAILED);
            payment.setOrderId("ERROR_" + dto.getAdId()); // marker for debugging
            System.out.println("❌ Razorpay Exception: " + e.getMessage());
        }

        paymentRepository.save(payment);
        return toDto(payment);
    }

    @Override
    public boolean verifySignature(String orderId, String paymentId, String signature) {
        try {
            JSONObject attributes = new JSONObject();
            attributes.put("razorpay_order_id", orderId);
            attributes.put("razorpay_payment_id", paymentId);
            attributes.put("razorpay_signature", signature);

            boolean isValid = Utils.verifyPaymentSignature(attributes, razorpaySecret);

            if (isValid) {
                // ✅ Update payment status
                updatePaymentStatus(orderId, PaymentStatus.SUCCESS);

                // ✅ Fetch payment record
                Payment payment = paymentRepository.findByOrderId(orderId)
                        .orElseThrow(() -> new RuntimeException("Payment not found"));

                // ✅ Update Ad status if adId exists
                if (payment.getAdId() != null) {
                    System.out.println("Updating Ad ID " + payment.getAdId() + " to PENDING_APPROVAL");
                    adServiceClient.updateAdStatus(payment.getAdId(), "PENDING_APPROVAL");
                } else {
                    System.out.println("⚠️ Ad ID is null, cannot update Ad status");
                }
            }

            return isValid;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    @Override
    public void updatePaymentStatus(String orderId, PaymentStatus status) {
        Payment payment = paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        payment.setStatus(status);
        paymentRepository.save(payment);
    }

    private PaymentResponseDto toDto(Payment payment) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setPaymentId(payment.getPaymentId());
        dto.setAdId(payment.getAdId());
        dto.setOrderId(payment.getOrderId());
        dto.setVendorId(payment.getVendorId());
        dto.setAmount(payment.getAmount());
        dto.setStatus(payment.getStatus().name());
        dto.setCreatedAt(payment.getCreatedAt().toString());
        return dto;
    }

    @Override
    public PaymentResponseDto getPaymentByAd(Long adId) {
        Payment payment = paymentRepository.findByAdId(adId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Payment not found for Ad ID: " + adId));
        return toDto(payment);
    }

    @Override
    public List<PaymentResponseDto> getPaymentsByVendor(Long vendorId) {
        return paymentRepository.findByVendorId(vendorId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public void syncAdData(AdSyncDto dto) {
        // ✅ Same fix mirrored here: update the existing row for this ad
        // if one already exists, instead of always inserting a new one.
        Payment payment = paymentRepository.findByAdId(dto.getAdId())
                .stream()
                .findFirst()
                .orElseGet(Payment::new);

        payment.setAdId(dto.getAdId());
        payment.setVendorId(dto.getVendorId());
        payment.setPlanId(dto.getPlanId());
        payment.setAmount(dto.getAmount());
        payment.setStatus(dto.getStatus());
        paymentRepository.save(payment);
    }
}