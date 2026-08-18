package com.adelevate.dtos.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@AllArgsConstructor
@NoArgsConstructor
public class AuthLoginResponseDto {

    private String token;   // ✅ JWT token
    private String role;    // ✅ Role of user (ADMIN / CUSTOMER / VENDOR)
    private String email;   // ✅ Optional: return email for confirmation
    private Long userId;    // ✅ User ID
    private String name;    // ✅ User Name
}
