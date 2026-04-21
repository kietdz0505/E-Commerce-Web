package com.example.ecommerce_web.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class UserProfileResponseDTO {
    private String id;
    private String username;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String gender;
    private LocalDate dob;
    private String picture;
    private Set<String> roles;
    private String authProvider;
}
