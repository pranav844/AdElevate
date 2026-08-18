package com.adelevate.controllers;

import com.adelevate.clients.LoggerClient;
import com.adelevate.dtos.ads.AdRequestDto;
import com.adelevate.dtos.ads.AdResponseDto;
import com.adelevate.enums.AdStatus;
import com.adelevate.services.AdService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ads")
@CrossOrigin(origins = "*") // ✅ Allow all origins (or restrict to frontend port if needed)
@RequiredArgsConstructor
public class AdController {

    private final AdService adService;
    private final LoggerClient loggerClient;

    // ✅ Create new Ad
    @PostMapping
    public ResponseEntity<AdResponseDto> createAd(@RequestBody AdRequestDto dto) {
        return ResponseEntity.ok(adService.createAd(dto));
    }

    // ✅ Test endpoint for MS.NET Logger
    @GetMapping("/test-log")
    public ResponseEntity<String> testLog() {
        loggerClient.sendLog("SpringBootBackend", "INFO", "TEST_LOG", "Manual test log from AdController", "USER_1");
        return ResponseEntity.ok("Test log sent to .NET Logger microservice!");
    }

    // ✅ Get Ad by ID (restricted to numbers only)
    @GetMapping("/{id:\\d+}")
    public ResponseEntity<AdResponseDto> getAdById(@PathVariable Long id) {
        return ResponseEntity.ok(adService.getAdById(id));
    }

    // ✅ Get all Ads, optionally filtered by status (e.g. GET /api/ads?status=APPROVED)
    @GetMapping
    public ResponseEntity<List<AdResponseDto>> getAllAds(
    		@RequestParam(required = false) String status,
    		@RequestParam(required = false) String category,
    		@RequestParam(required = false) String city)  {
    	if (category != null && !category.isBlank()) {
    	    return ResponseEntity.ok(adService.getAdsByCategory(category));
    	}
    	if (city != null && !city.isBlank()) {
    	    return ResponseEntity.ok(adService.getAdsByCity(city));
    	}
    	
        if (status != null && !status.isBlank()) {
            try {
                return ResponseEntity.ok(adService.getAdsByStatus(AdStatus.valueOf(status)));
            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.ok(adService.getAllAds());
    }

    // ✅ Update Ad
    @PutMapping("/{id}")
    public ResponseEntity<AdResponseDto> updateAd(@PathVariable Long id, @RequestBody AdRequestDto dto) {
        return ResponseEntity.ok(adService.updateAd(id, dto));
    }

    // ✅ Delete Ad
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAd(@PathVariable Long id) {
        adService.deleteAd(id);
        return ResponseEntity.noContent().build();
    }

    // ✅ Approve Ad
    @PutMapping("/{id}/approve")
    public ResponseEntity<AdResponseDto> approveAd(@PathVariable Long id) {
        return ResponseEntity.ok(adService.approveAd(id));
    }

    // ✅ Reject Ad
    @PutMapping("/{id}/reject")
    public ResponseEntity<AdResponseDto> rejectAd(@PathVariable Long id) {
        return ResponseEntity.ok(adService.rejectAd(id));
    }

    // ✅ Get Approved Ads
    @GetMapping("/approved")
    public ResponseEntity<List<AdResponseDto>> getApprovedAds() {
        return ResponseEntity.ok(adService.getApprovedAds());
    }

    // ✅ Get Active Ads
    @GetMapping("/active")
    public ResponseEntity<List<AdResponseDto>> getActiveAds() {
        return ResponseEntity.ok(adService.getActiveAds());
    }

    // ✅ Update Ad Status (used by Payment microservice)
    @PutMapping("/{adId}/status")
    public ResponseEntity<String> updateAdStatus(@PathVariable Long adId,
                                                 @RequestParam String status) {
        try {
            AdStatus adStatus = AdStatus.valueOf(status);
            adService.updateAdStatusAfterPayment(adId, adStatus);
            return ResponseEntity.ok("Ad status updated to " + status);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status: " + status);
        }
    }
    
    @GetMapping("/vendor/{vendorId}")
    public ResponseEntity<List<AdResponseDto>> getAdsByVendor(@PathVariable Long vendorId) {
        return ResponseEntity.ok(adService.getAdsByVendor(vendorId));
    }

}
