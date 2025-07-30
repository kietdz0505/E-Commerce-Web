package com.example.ecommerce_web.dto;

import com.example.ecommerce_web.model.Role;
import lombok.Data;

import java.time.LocalDate;
import java.util.Set;

@Data
public class UserProfileUpdateDTO {
    private String name;
    private String phone;
    private String address;
    private String gender;
    private LocalDate dob;
    private String picture;
    private Set<Role> roles;
}
