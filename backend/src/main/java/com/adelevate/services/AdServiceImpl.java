package com.adelevate.services;

import com.adelevate.dtos.ads.AdRequestDto;
import com.adelevate.dtos.ads.AdResponseDto;
import com.adelevate.dtos.ads.AdSyncDto;
import com.adelevate.entities.*;
import com.adelevate.enums.AdCategory;
import com.adelevate.enums.AdStatus;
import com.adelevate.repositories.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.stream.Collectors;

import com.adelevate.clients.LoggerClient;

@Service
@RequiredArgsConstructor
public class AdServiceImpl implements AdService {

    private final AdRepository adRepository;
    private final BusinessVendorRepository vendorRepository;
    private final SubscriptionPlanRepository planRepository;
    private final LocationRepository locationRepository;
    private final RestTemplate restTemplate; // ✅ For cross-service sync
    private final LoggerClient loggerClient;

    @Override
    public AdResponseDto createAd(AdRequestDto dto) {
        BusinessVendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new RuntimeException("Vendor not found"));
        SubscriptionPlan plan = planRepository.findById(dto.getPlanId())
                .orElseThrow(() -> new RuntimeException("Plan not found"));
        Location location = locationRepository.findById(dto.getLocationId())
                .orElseThrow(() -> new RuntimeException("Location not found"));

        // ✅ Create Ad entity
        Ad ad = new Ad();
        ad.setTitle(dto.getTitle());
        ad.setDescription(dto.getDescription());
        ad.setProductImage(dto.getProductImage());
        ad.setCategory(AdCategory.valueOf(dto.getCategory()));
        ad.setStatus(AdStatus.PENDING_PAYMENT); // Default status
        ad.setExpirationDate(dto.getExpirationDate());
        ad.setMinPrice(dto.getMinPrice());
        ad.setMaxPrice(dto.getMaxPrice());
        ad.setVendor(vendor);
        ad.setSubscriptionPlan(plan);
        ad.setLocation(location);

        adRepository.save(ad);

        loggerClient.sendLog("SpringBootBackend", "INFO", "AD_CREATED",
                "Ad created: '" + ad.getTitle() + "' (ID: " + ad.getAdId() + ")",
                String.valueOf(dto.getVendorId()));

        // ✅ Sync Ad data to Payment microservice
        AdSyncDto syncDto = new AdSyncDto();
        syncDto.setAdId(ad.getAdId());
        syncDto.setVendorId(dto.getVendorId());
        syncDto.setPlanId(dto.getPlanId());
        syncDto.setAmount(dto.getMinPrice()); // or dto.getMaxPrice()
        syncDto.setStatus(ad.getStatus().name());

        try {
            restTemplate.postForObject("http://localhost:8081/api/payments/syncAd", syncDto, String.class);
        } catch (Exception e) {
            loggerClient.sendLog("SpringBootBackend", "WARN", "PAYMENT_SYNC_WARN",
                    "Ad created but payment sync failed for Ad ID: " + ad.getAdId(),
                    String.valueOf(dto.getVendorId()));
        }

        return toDto(ad);
    }

    @Override
    public AdResponseDto getAdById(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        return toDto(ad);
    }

    @Override
    public List<AdResponseDto> getAllAds() {
        return adRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public AdResponseDto updateAd(Long id, AdRequestDto dto) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));

        ad.setTitle(dto.getTitle());
        ad.setDescription(dto.getDescription());
        ad.setProductImage(dto.getProductImage());
        ad.setCategory(AdCategory.valueOf(dto.getCategory()));
        ad.setExpirationDate(dto.getExpirationDate());
        ad.setMinPrice(dto.getMinPrice());
        ad.setMaxPrice(dto.getMaxPrice());

        adRepository.save(ad);
        return toDto(ad);
    }

    @Override
    public void deleteAd(Long id) {
        adRepository.deleteById(id);
    }

    @Override
    public AdResponseDto approveAd(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        ad.setStatus(AdStatus.APPROVED);
        adRepository.save(ad);

        loggerClient.sendLog("SpringBootBackend", "INFO", "AD_APPROVED",
                "Ad approved by Admin: '" + ad.getTitle() + "' (ID: " + ad.getAdId() + ")", "ADMIN");

        return toDto(ad);
    }

    @Override
    public AdResponseDto rejectAd(Long id) {
        Ad ad = adRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        ad.setStatus(AdStatus.REJECTED);
        adRepository.save(ad);

        loggerClient.sendLog("SpringBootBackend", "INFO", "AD_REJECTED",
                "Ad rejected by Admin: '" + ad.getTitle() + "' (ID: " + ad.getAdId() + ")", "ADMIN");

        return toDto(ad);
    }

    @Override
    public List<AdResponseDto> getApprovedAds() {
        return adRepository.findByStatus(AdStatus.APPROVED)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdResponseDto> getActiveAds() {
        return adRepository.findByStatus(AdStatus.ACTIVE)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AdResponseDto> getAdsByStatus(AdStatus status) {
        return adRepository.findByStatus(status)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ✅ Convert Entity → DTO
    private AdResponseDto toDto(Ad ad) {
        AdResponseDto dto = new AdResponseDto();
        dto.setAdId(ad.getAdId());
        dto.setDescription(ad.getDescription());
        dto.setMinPrice(ad.getMinPrice());
        dto.setMaxPrice(ad.getMaxPrice());
        dto.setVendorId(ad.getVendor().getVendorId());

        dto.setTitle(ad.getTitle());
        dto.setCategory(ad.getCategory().name());
        dto.setCity(ad.getLocation().getCity());
        dto.setProductImage(ad.getProductImage());
        dto.setPlanType(ad.getSubscriptionPlan().getPlanName().name());
        dto.setAverageRating(adRepository.findAverageRatingByAdId(ad.getAdId()));
        dto.setTotalReviews(adRepository.countRatingsByAdId(ad.getAdId()));
        dto.setPriceRange("₹" + ad.getMinPrice() + "–₹" + ad.getMaxPrice());
        dto.setStatus(ad.getStatus().name());
        return dto;
    }

    @Override
    public void updateAdStatusAfterPayment(Long adId, AdStatus status) {
        Ad ad = adRepository.findById(adId)
                .orElseThrow(() -> new RuntimeException("Ad not found"));
        ad.setStatus(status);
        adRepository.save(ad);
    }

	@Override
	public List<AdResponseDto> getAdsByCategory(String category) {
		 AdCategory adCategory = AdCategory.valueOf(category.toUpperCase());
		    return adRepository.findByCategory(adCategory)  // ← repository mein pehle se hai!
		            .stream()
		            .map(this::toDto)
		            .collect(Collectors.toList());
	}

	@Override
	public List<AdResponseDto> getAdsByCity(String city) {
		 return adRepository.findByLocationCity(city)    // ← repository mein pehle se hai!
		            .stream()
		            .map(this::toDto)
		            .collect(Collectors.toList());
	}

	@Override
	public List<AdResponseDto> getAdsByVendor(Long vendorId) {
		 return adRepository.findByVendorVendorId(vendorId)  // ← already hai repo mein!
		            .stream()
		            .map(this::toDto)
		            .collect(Collectors.toList());
	}
}
