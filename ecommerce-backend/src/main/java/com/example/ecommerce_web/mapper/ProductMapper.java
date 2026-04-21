package com.example.ecommerce_web.mapper;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.Review;

public class ProductMapper {
    public static ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setAvailable(product.isAvailable());

        if (product.getBrand() != null) {
            dto.setBrandId(product.getBrand().getId());
            dto.setBrandName(product.getBrand().getName());
        }

        if (product.getCategory() != null) {
            dto.setCategoryId(product.getCategory().getId());
            dto.setCategoryName(product.getCategory().getName());
        }

        // Review count
        if (product.getReviews() != null && !product.getReviews().isEmpty()) {
            dto.setReviewCount((long) product.getReviews().size());
            double avg = product.getReviews().stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            dto.setAverageRating(avg);
        } else {
            dto.setReviewCount(0L);
            dto.setAverageRating(0.0);
        }

        return dto;
    }



    public static Product toEntity(ProductDTO dto) {
        Product product = new Product();
        product.setId(dto.getId());
        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setImageUrl(dto.getImageUrl());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setAvailable(dto.isAvailable());
        // Brand và Category set ở Service Layer
        return product;
    }

}
