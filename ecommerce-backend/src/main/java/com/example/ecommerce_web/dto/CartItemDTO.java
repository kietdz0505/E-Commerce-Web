package com.example.ecommerce_web.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private ProductDTO product;
    private int quantity;
    private double price;
}
