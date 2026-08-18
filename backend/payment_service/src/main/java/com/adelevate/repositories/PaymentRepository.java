package com.adelevate.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.adelevate.entities.Payment;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByVendorId(Long vendorId);
    List<Payment> findByAdId(Long adId);
    Optional<Payment> findByOrderId(String orderId);
}
