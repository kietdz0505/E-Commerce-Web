package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.config.PaginationProperties;
import com.example.ecommerce_web.dto.AdminReviewDTO;
import com.example.ecommerce_web.service.ReviewService;
import com.example.ecommerce_web.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/products/{productId}/reviews")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReviewController {

    private final ReviewService reviewService;
    private final PaginationProperties paginationProperties;

    public AdminReviewController(ReviewService reviewService, PaginationProperties paginationProperties) {
        this.reviewService = reviewService;
        this.paginationProperties = paginationProperties;
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long productId,
                                             @PathVariable Long reviewId) {
        String userId = SecurityUtils.getCurrentUserId();
        reviewService.deleteReview(productId, reviewId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<AdminReviewDTO>> getReviewsByProduct(
            @PathVariable Long productId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        int currentPage = (page != null) ? page : paginationProperties.getDefaultPage();
        int currentSize = (size != null) ? size : paginationProperties.getDefaultPageSize();

        Pageable pageable = PageRequest.of(currentPage, currentSize);

        Page<AdminReviewDTO> reviews = reviewService.getReviewsByProductIdForAdmin(productId, pageable);
        return ResponseEntity.ok(reviews);
    }

}
