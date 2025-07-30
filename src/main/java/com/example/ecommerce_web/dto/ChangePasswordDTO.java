package com.example.ecommerce_web.dto;

import lombok.Data;

@Data
public class ChangePasswordDTO {
    private String currentPassword;
    private String newPassword;
}
