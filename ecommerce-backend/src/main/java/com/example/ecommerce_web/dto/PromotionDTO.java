package com.example.ecommerce_web.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PromotionDTO {
    private Long id;
    private String code;
    private String description;
    private BigDecimal discountPercent;
    private Integer usageLimit;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private List<SimpleProductDTO> products;
}
