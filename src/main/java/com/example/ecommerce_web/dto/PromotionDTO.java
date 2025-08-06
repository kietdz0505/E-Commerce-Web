package com.example.ecommerce_web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
public class PromotionDTO {
    private Long id;
    private String code;
    private String description;
    private BigDecimal discountPercent;
    private List<SimpleProductDTO> products;
}
