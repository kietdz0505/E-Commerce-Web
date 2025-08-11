package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.AdminDashboardStatsDTO;
import com.example.ecommerce_web.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final BrandRepository brandRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ReviewRepository reviewRepository;

    public AdminDashboardStatsDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalCategories = categoryRepository.count();
        long totalBrands = brandRepository.count();
        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalReviews = reviewRepository.count();

        return new AdminDashboardStatsDTO(
                totalUsers,
                totalCategories,
                totalBrands,
                totalOrders,
                totalProducts,
                totalReviews
        );
    }
}
