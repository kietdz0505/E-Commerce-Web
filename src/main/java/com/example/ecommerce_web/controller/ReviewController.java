package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.model.Review;
import com.example.ecommerce_web.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final ReviewService reviewService;

    @GetMapping
    public List<Review> getAll() {
        return reviewService.getAll();
    }

    @PostMapping
    public Review create(@RequestBody Review review) {
        return reviewService.save(review);
    }
}
