package com.adelevate.controllers;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;

import com.adelevate.securityConfig.JwtUtil;
import com.adelevate.services.AdminService;
import com.adelevate.services.BusinessVendorService;
import com.adelevate.services.CustomerService;
import com.adelevate.services.UserService;
import com.adelevate.repositories.AdminRepository;
import com.adelevate.repositories.UserRepository;
import com.adelevate.entities.Admin;
import com.adelevate.entities.User;
import com.adelevate.enums.Role;
import com.adelevate.dtos.auth.AuthLoginRequestDto;
import com.adelevate.dtos.auth.AuthLoginResponseDto;
import com.adelevate.dtos.user.UserRequestDto;
import com.adelevate.dtos.user.UserResponseDto;

import org.springframework.security.crypto.password.PasswordEncoder;

import com.adelevate.clients.LoggerClient;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final CustomerService customerService;
    private final BusinessVendorService businessVendorService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AdminService adminService;
    private final AdminRepository adminRepository;
    private final LoggerClient loggerClient;

    // ✅ Register endpoint
    @PostMapping("/register")
    @Transactional
    public ResponseEntity<UserResponseDto> registerUser(@RequestBody @Valid UserRequestDto dto) {
        User savedUser = userService.register(dto);

        if (savedUser.getRole() == Role.CUSTOMER) {
            customerService.createCustomer(savedUser);
        } else if (savedUser.getRole() == Role.VENDOR) {
            businessVendorService.createVendor(savedUser, dto.getBusinessName(), dto.getBusinessCategory());
        } else if (savedUser.getRole() == Role.ADMIN) {
            adminService.createAdmin(savedUser);
        }

        loggerClient.sendLog("SpringBootBackend", "INFO", "USER_REGISTER",
                "New user registered: " + savedUser.getEmail() + " as " + savedUser.getRole(),
                String.valueOf(savedUser.getUserId()));

        return ResponseEntity.ok(userService.getUserById(savedUser.getUserId()));
    }

    // ✅ Login endpoint
    @PostMapping("/login")
    public ResponseEntity<AuthLoginResponseDto> login(@RequestBody AuthLoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loggerClient.sendLog("SpringBootBackend", "WARN", "LOGIN_FAILED",
                    "Failed login attempt for email: " + request.getEmail(), "GUEST");
            return ResponseEntity.status(401).body(null);
        }

        // ✅ If Admin, update lastLogin
        if (user.getRole() == Role.ADMIN) {
            Admin admin = adminRepository.findById(user.getUserId())
                    .orElseThrow(() -> new RuntimeException("Admin not found"));
            admin.setLastLogin(LocalDateTime.now());
            adminRepository.save(admin);
        }

        // ✅ Enum ko "ROLE_" prefix ke saath convert karo
        List<String> roles = List.of("ROLE_" + user.getRole().name());

        // ✅ Token generate with roles
        String token = jwtUtil.generateToken(user.getEmail(), roles);

        AuthLoginResponseDto response = new AuthLoginResponseDto(
                token,
                user.getRole().name(),
                user.getEmail(),
                user.getUserId(),
                user.getName()
        );

        loggerClient.sendLog("SpringBootBackend", "INFO", "USER_LOGIN",
                "User logged in successfully: " + user.getEmail(),
                String.valueOf(user.getUserId()));

        return ResponseEntity.ok(response);
    }

}
