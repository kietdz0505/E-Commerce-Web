package com.example.ecommerce_web.dto;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReviewRequestDTO {
    private String comment;
    private int rating;
    private String imageUrl;
}
