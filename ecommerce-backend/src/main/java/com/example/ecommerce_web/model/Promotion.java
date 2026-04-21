package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "promotions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Promotion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String code;
    private String description;
    private BigDecimal discountPercent;
    private Integer usageLimit;
    private LocalDateTime validFrom;
    private LocalDateTime validTo;

    @ManyToMany
    @JoinTable(
            name = "promotion_products",
            joinColumns = @JoinColumn(name = "promotion_id"),
            inverseJoinColumns = @JoinColumn(name = "product_id")
    )
    private List<Product> products = new ArrayList<>();

    @OneToMany(mappedBy = "promotion", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserPromotion> userPromotions = new HashSet<>();

    public boolean isActive() {
        LocalDateTime now = LocalDateTime.now();
        return validFrom != null && validTo != null
                && validFrom.isBefore(now)
                && validTo.isAfter(now);
    }
}
