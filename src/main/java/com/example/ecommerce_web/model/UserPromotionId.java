package com.example.ecommerce_web.model;

import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class UserPromotionId implements Serializable {
    private String userId;
    private Long promotionId;
}
