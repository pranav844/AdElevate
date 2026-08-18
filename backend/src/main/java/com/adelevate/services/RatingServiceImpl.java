package com.adelevate.services;

import com.adelevate.dtos.rating.RatingRequestDto;
import com.adelevate.dtos.rating.RatingResponseDto;
import com.adelevate.entities.Ad;
import com.adelevate.entities.Customer;
import com.adelevate.entities.Rating;
import com.adelevate.exception.ResourceNotFoundException;
import com.adelevate.repositories.AdRepository;
import com.adelevate.repositories.CustomerRepository;
import com.adelevate.repositories.RatingRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class RatingServiceImpl implements RatingService {

    private final RatingRepository ratingRepository;
    private final AdRepository adRepository;
    private final CustomerRepository customerRepository;

    @Override
    public RatingResponseDto createRating(RatingRequestDto dto) {
        Ad ad = adRepository.findById(dto.getAdId())
                .orElseThrow(() -> new ResourceNotFoundException("Ad not found with id: " + dto.getAdId()));

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + dto.getCustomerId()));

        Rating rating = new Rating();
        rating.setRatingValue(dto.getRatingValue());
        rating.setReviewText(dto.getReviewText());
        rating.setAd(ad);
        rating.setCustomer(customer);

        Rating savedRating = ratingRepository.save(rating);
        return mapToDto(savedRating);
    }

    @Override
    public List<RatingResponseDto> getRatingsByAd(Long adId) {
        return ratingRepository.findByAdAdId(adId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<RatingResponseDto> getRatingsByCustomer(Long customerId) {
        return ratingRepository.findByCustomerCustomerId(customerId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteRating(Long ratingId) {
        Rating rating = ratingRepository.findById(ratingId)
                .orElseThrow(() -> new ResourceNotFoundException("Rating not found with id: " + ratingId));
        ratingRepository.delete(rating);
    }

    private RatingResponseDto mapToDto(Rating rating) {
        RatingResponseDto dto = new RatingResponseDto();
        dto.setRatingId(rating.getRatingId());
        dto.setRatingValue(rating.getRatingValue());
        dto.setReviewText(rating.getReviewText());
        dto.setCreatedAt(rating.getCreatedAt());
        dto.setAdId(rating.getAd().getAdId());
        dto.setCustomerId(rating.getCustomer().getCustomerId());
        if (rating.getCustomer().getUser() != null) {
            dto.setCustomerName(rating.getCustomer().getUser().getName());
        }
        return dto;
    }
}
