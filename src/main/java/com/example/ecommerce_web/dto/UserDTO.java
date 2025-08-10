package com.example.ecommerce_web.dto;

import com.example.ecommerce_web.model.AuthProvider;
import com.example.ecommerce_web.model.Role;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class UserDTO {
    private String id;
    private String username;
    private String name;
    private String email;
    private String picture;
    private String phone;
    private String address;
    private String gender;
    private LocalDate dob;
    private AuthProvider authProvider;  // Enum
    private Set<String> roles;
    private boolean locked;
}
