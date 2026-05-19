package com.example.ecommerce_web.dto;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class ProductReviewResponse {

    private List<ReviewDTO> content;

    private int page;
    private int size;

    private long totalElements;
    private int totalPages;
    private boolean last;

    // UI metadata
    private boolean hasPurchased;
    private boolean hasReviewed;
    private ReviewDTO myReview;
}