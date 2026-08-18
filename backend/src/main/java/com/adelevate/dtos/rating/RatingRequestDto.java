package com.adelevate.dtos.rating;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class RatingRequestDto {

    @NotNull(message = "Rating value is required")
    @Min(value = 1, message = "Rating value must be at least 1")
    @Max(value = 5, message = "Rating value must be at most 5")
    private Integer ratingValue;

    private String reviewText;

    @NotNull(message = "Ad ID is required")
    private Long adId;

    @NotNull(message = "Customer ID is required")
    private Long customerId;
}
