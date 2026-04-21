package com.example.ecommerce_web.dto;


import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemRequest {
    private Long productId;
    private int quantity;
    private BigDecimal unitPrice;
    private BigDecimal discountedUnitPrice;
}

