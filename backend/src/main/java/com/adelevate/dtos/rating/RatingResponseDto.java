package com.adelevate.dtos.rating;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter @Setter
public class RatingResponseDto {
    private Long ratingId;
    private Integer ratingValue;
    private String reviewText;
    private LocalDateTime createdAt;
    private Long adId;
    private Long customerId;
    private String customerName;
}
