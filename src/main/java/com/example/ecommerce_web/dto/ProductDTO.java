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
    private Long categoryId;
    private String categoryName;
    private Long brandId;         // Thêm brandId
    private String brandName;     // Thêm brandName
    private Double averageRating; // Thêm averageRating (mức đánh giá trung bình)
}
