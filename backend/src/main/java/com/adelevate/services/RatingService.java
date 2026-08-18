package com.adelevate.services;

import com.adelevate.dtos.rating.RatingRequestDto;
import com.adelevate.dtos.rating.RatingResponseDto;

import java.util.List;

public interface RatingService {
    RatingResponseDto createRating(RatingRequestDto dto);
    List<RatingResponseDto> getRatingsByAd(Long adId);
    List<RatingResponseDto> getRatingsByCustomer(Long customerId);
    void deleteRating(Long ratingId);
}
