package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.service.ReviewService;
import com.example.ecommerce_web.util.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products/{productId}/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;

    public AdminReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long productId,
                                             @PathVariable Long reviewId) {
        String userId = SecurityUtils.getCurrentUserId();
        reviewService.deleteReview(productId, reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}
