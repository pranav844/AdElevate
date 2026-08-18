package com.adelevate.dtos.ads;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class AdResponseDto {
	private Long adId;
	private String description;
	private Double minPrice;
	private Double maxPrice;
	private Long vendorId;

    private String title;             // TrendZone Fashion Hub
    private String category;          // Clothing & Fashion
    private String city;              // Bangalore, KA
    private String productImage;      // Image URL or path
    private String planType;          // PLATINUM / GOLD / SILVER
    private Long planId;              // 1, 2, 3
    private String planName;          // PLATINUM / GOLD / SILVER
    private Double planPrice;         // 1299.0, 799.0, 499.0
    private Double averageRating;     // 4.8
    private Integer totalReviews;     // 128
    private String priceRange;        // ₹999–₹4,999 or ₹299/visit
    private String status; // from AdStatus enum

}
