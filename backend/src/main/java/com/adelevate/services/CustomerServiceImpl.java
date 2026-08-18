package com.adelevate.services;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import com.adelevate.entities.Customer;
import com.adelevate.entities.User;
import com.adelevate.exception.ResourceNotFoundException;
import com.adelevate.repositories.CustomerRepository;
import com.adelevate.repositories.UserRepository;

import jakarta.transaction.Transactional;

import com.adelevate.dtos.customer.CustomerResponseDto;
import com.adelevate.dtos.user.UpdateUserRequest;

@Service
@RequiredArgsConstructor
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private CustomerResponseDto mapToResponse(Customer customer) {
        CustomerResponseDto dto = new CustomerResponseDto();
        dto.setCustomerId(customer.getCustomerId());
        User user = customer.getUser();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhoneNumber(user.getPhoneNumber());
        dto.setStatus(user.getStatus().name());
        return dto;
    }

    @Override
    public CustomerResponseDto createCustomer(User user) {
        // ✅ Ensure managed User
        User managedUser = userRepository.findById(user.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Customer customer = new Customer();
        customer.setUser(managedUser);

        Customer savedCustomer = customerRepository.save(customer);
        return mapToResponse(savedCustomer);
    }

    @Override
    public CustomerResponseDto getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
        return mapToResponse(customer);
    }

    @Override
    public List<CustomerResponseDto> getAllCustomers() {
        return customerRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public CustomerResponseDto updateCustomerProfile(Long id, UpdateUserRequest request) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));

        User user = customer.getUser();
        if (request.getFullName() != null) user.setName(request.getFullName());
        if (request.getPhoneNumber() != null) user.setPhoneNumber(request.getPhoneNumber());
        if (request.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getStatus() != null) user.setStatus(request.getStatus());

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        return mapToResponse(customer);
    }
}
