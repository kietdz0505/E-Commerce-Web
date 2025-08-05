package com.example.ecommerce_web.dto;

import lombok.Data;

@Data
public class OrderItemResponse {
    private Long productId;
    private String productName;
    private int quantity;
    private double unitPrice;
}
