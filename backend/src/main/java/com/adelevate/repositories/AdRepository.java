package com.adelevate.repositories;

import com.adelevate.entities.Ad;
import com.adelevate.enums.AdCategory;
import com.adelevate.enums.AdStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface AdRepository extends JpaRepository<Ad, Long> {
    List<Ad> findByCategory(AdCategory category);
    List<Ad> findByVendorVendorId(Long vendorId);
    List<Ad> findByStatus(AdStatus status);   // ✅ New: filter ads by status
    List<Ad> findByLocationCity(String city); // ✅ New: filter ads by city

    @Query("SELECT AVG(r.ratingValue) FROM Rating r WHERE r.ad.adId = :adId")
    Double findAverageRatingByAdId(@Param("adId") Long adId);

    @Query("SELECT COUNT(r.ratingId) FROM Rating r WHERE r.ad.adId = :adId")
    Integer countRatingsByAdId(@Param("adId") Long adId);
}
