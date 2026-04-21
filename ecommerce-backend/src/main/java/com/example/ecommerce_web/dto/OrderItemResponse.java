package com.example.ecommerce_web.dto;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import java.math.BigDecimal;
import lombok.Data;

@Data
public class OrderItemResponse {

    private Long productId;
    private String productName;
    private int quantity;

    @JsonSerialize(using = VndBigDecimalSerializer.class)
    private BigDecimal unitPrice;

    @JsonSerialize(using = VndBigDecimalSerializer.class)
    private BigDecimal discountedUnitPrice;

    // getters & setters...
}
