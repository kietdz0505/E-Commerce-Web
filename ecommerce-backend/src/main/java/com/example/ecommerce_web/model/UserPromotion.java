package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users_promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserPromotion {

    @EmbeddedId
    private UserPromotionId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "users_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("promotionId")
    @JoinColumn(name = "promotions_id")
    private Promotion promotion;

    @Enumerated(EnumType.STRING)
    private PromotionStatus status = PromotionStatus.SENT;

    private LocalDateTime sentAt = LocalDateTime.now();
    private LocalDateTime viewedAt;
    private LocalDateTime clickedAt;
}
