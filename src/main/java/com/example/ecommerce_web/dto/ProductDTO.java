package com.example.ecommerce_web.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductDTO {

    private Long id;

    @NotBlank(message = "Name không được để trống")
    private String name;

    @NotBlank(message = "Description không được để trống")
    private String description;

    @NotBlank(message = "Image URL không được để trống")
    private String imageUrl;

    @NotNull(message = "Price không được để trống")
    @Positive(message = "Price phải lớn hơn 0")
    private Double price;

    @Min(value = 0, message = "Stock phải lớn hoặc bằng 0")
    private int stock;

    private boolean available;

    @NotNull(message = "BrandId không được để trống")
    private Long brandId;

    private String brandName;

    private Double averageRating;

    private Long reviewCount;

    @NotNull(message = "CategoryId không được để trống")
    private Long categoryId;

    private String categoryName;
}
