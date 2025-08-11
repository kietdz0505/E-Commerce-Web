package com.example.ecommerce_web.dto;

import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
public class AdminDashboardStatsDTO {
    private long totalUsers;
    private long totalCategories;
    private long totalBrands;
    private long totalOrders;
    private long totalProducts;
    private long totalReviews;
}
