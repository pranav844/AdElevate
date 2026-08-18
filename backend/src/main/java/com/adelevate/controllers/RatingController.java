package com.adelevate.controllers;

import com.adelevate.dtos.rating.RatingRequestDto;
import com.adelevate.dtos.rating.RatingResponseDto;
import com.adelevate.services.RatingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ratings")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class RatingController {

    private final RatingService ratingService;

    // ✅ Submit rating / review
    @PostMapping
    public ResponseEntity<RatingResponseDto> createRating(@Valid @RequestBody RatingRequestDto dto) {
        return ResponseEntity.ok(ratingService.createRating(dto));
    }

    // ✅ Get ratings by Ad ID
    @GetMapping("/ad/{adId}")
    public ResponseEntity<List<RatingResponseDto>> getRatingsByAd(@PathVariable Long adId) {
        return ResponseEntity.ok(ratingService.getRatingsByAd(adId));
    }

    // ✅ Get ratings by Customer ID
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<RatingResponseDto>> getRatingsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(ratingService.getRatingsByCustomer(customerId));
    }

    // ✅ Delete rating
    @DeleteMapping("/{ratingId}")
    public ResponseEntity<Void> deleteRating(@PathVariable Long ratingId) {
        ratingService.deleteRating(ratingId);
        return ResponseEntity.noContent().build();
    }
}
