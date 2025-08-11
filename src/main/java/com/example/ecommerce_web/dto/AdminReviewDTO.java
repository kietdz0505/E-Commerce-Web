package com.example.ecommerce_web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdminReviewDTO {
    private Long id;
    private String comment;
    private int rating;
    private String imageUrl;
    private String userId;
    private String userName;
    private String userAvatar;
    private LocalDateTime createdAt;
}
