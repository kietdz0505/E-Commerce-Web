package com.example.ecommerce_web.dto;

import lombok.Data;

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
}
