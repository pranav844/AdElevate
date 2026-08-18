package com.adelevate.services;

import com.adelevate.dtos.ads.AdRequestDto;

import com.adelevate.dtos.ads.AdResponseDto;
import com.adelevate.enums.AdStatus;

import java.util.List;

public interface AdService {
    AdResponseDto createAd(AdRequestDto dto);
    AdResponseDto getAdById(Long id);
    List<AdResponseDto> getAllAds();
    AdResponseDto updateAd(Long id, AdRequestDto dto);
    void deleteAd(Long id);

    // ✅ New methods for Phase 3
    AdResponseDto approveAd(Long id);   // Admin approves
    AdResponseDto rejectAd(Long id);    // Admin rejects
    List<AdResponseDto> getApprovedAds(); // Customers view only approved ads
    List<AdResponseDto> getActiveAds();   // Ads that are approved + not expired
    List<AdResponseDto> getAdsByStatus(AdStatus status); // Generic status filter for dashboard
    List<AdResponseDto> getAdsByCategory(String category);
    List<AdResponseDto> getAdsByCity(String city);
    List<AdResponseDto> getAdsByVendor(Long vendorId);

    void updateAdStatusAfterPayment(Long adId, AdStatus status);

}
