package com.example.ecommerce_web.dto;

import com.example.ecommerce_web.model.PromotionStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPromotionDTO {
    private Long promotionId;
    private String code;
    private String description;
    private BigDecimal discountPercent;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;
    private boolean active;
    private PromotionStatus status;
    private LocalDateTime sentAt;
    private LocalDateTime viewedAt;
    private LocalDateTime clickedAt;
}
