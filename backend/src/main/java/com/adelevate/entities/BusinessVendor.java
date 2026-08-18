package com.adelevate.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Entity
@Table(name = "businessvendor")
@Getter @Setter
public class BusinessVendor {

    @Id
    private Long vendorId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "vendor_id")
    private User user;

    private String businessName;
    private String businessCategory;

    @Column(columnDefinition = "boolean default false")
    private boolean isDeleted = false;

    // ✅ Vendor ke ads ka relation
    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Ad> ads;
}
