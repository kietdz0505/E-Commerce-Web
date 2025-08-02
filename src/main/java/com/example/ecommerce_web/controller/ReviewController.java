package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ReviewDTO;
import com.example.ecommerce_web.dto.ReviewRequestDTO;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.service.CloudinaryService;
import com.example.ecommerce_web.service.ReviewService;
import com.example.ecommerce_web.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<ReviewDTO>> getProductReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }
    @Autowired
    private CloudinaryService cloudinaryService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewDTO> submitReview(@PathVariable Long productId,
                                                  @RequestParam String comment,
                                                  @RequestParam int rating,
                                                  @RequestPart(required = false) MultipartFile image,
                                                  Principal principal) {
        User user = userService.findByEmail(principal.getName());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        ReviewDTO newReview = reviewService.addReview(productId, user.getId(), comment, rating, imageUrl);
        return ResponseEntity.ok(newReview);
    }


    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long productId,
                                             @PathVariable Long reviewId,
                                             Principal principal) {
        User user = userService.findByEmail(principal.getName());
        reviewService.deleteReview(productId, reviewId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable Long productId,
                                                  @PathVariable Long reviewId,
                                                  @RequestBody ReviewDTO reviewDTO,
                                                  Principal principal) {
        User user = userService.findByEmail(principal.getName());
        ReviewDTO updatedReview = reviewService.updateReview(productId, reviewId, user.getId(), reviewDTO.getComment(), reviewDTO.getRating(), reviewDTO.getImageUrl());
        return ResponseEntity.ok(updatedReview);
    }
}
