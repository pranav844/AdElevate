package com.adelevate.dtos.customer;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class CustomerResponseDto {
    private Long customerId;
    private String name;
    private String email;
    private String phoneNumber;
    private String status;      // ACTIVE / INACTIVE
}
