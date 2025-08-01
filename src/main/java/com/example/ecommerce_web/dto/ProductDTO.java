package com.example.ecommerce_web.dto;

import lombok.Data;

@Data
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private String imageUrl;
    private Double price;
    private int stock;
    private boolean available;
    private Long brandId;
    private String brandName;
    private Double averageRating;
    private Long categoryId;
    private String categoryName;

}
