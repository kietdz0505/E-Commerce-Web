package com.example.ecommerce_web.dto;

import lombok.Data;

import java.time.LocalDate;

@Data
public class UserProfileUpdateDTO {
    private String name;
    private String phone;
    private String address;
    private String gender;
    private LocalDate dob;
    private String picture;
}
