package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ReviewDTO;
import com.example.ecommerce_web.dto.ReviewRequestDTO;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.service.CloudinaryService;
import com.example.ecommerce_web.service.ReviewService;
import com.example.ecommerce_web.service.UserService;
import com.example.ecommerce_web.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;

    @GetMapping("")
    public ResponseEntity<Page<ReviewDTO>> getProductReviews(
            @PathVariable Long productId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        String currentUserId = null;
        if (principal != null) {
            User user = userService.findByEmail(principal.getName());  // Lấy user từ email trong Token
            currentUserId = user.getId();
        }

        Page<ReviewDTO> reviews = reviewService.getReviewsByProduct(productId, pageable, currentUserId);
        return ResponseEntity.ok(reviews);
    }



    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewDTO> submitReview(@PathVariable Long productId,
                                                  @RequestParam String comment,
                                                  @RequestParam int rating,
                                                  @RequestPart(value = "image", required = false) MultipartFile image,
                                                  Principal principal) {
        User user = userService.findByEmail(principal.getName());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        ReviewDTO newReview = reviewService.addReview(productId, user.getId(), comment, rating, imageUrl);
        return ResponseEntity.ok(newReview);
    }



    @PutMapping(path = "/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewDTO> updateReview(
            @PathVariable Long productId,
            @PathVariable Long reviewId,
            @RequestParam String comment,
            @RequestParam int rating,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Principal principal
    ) {
        User user = userService.findByEmail(principal.getName());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        ReviewDTO updatedReview = reviewService.updateReview(productId, reviewId, user.getId(), comment, rating, imageUrl);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long productId,
                                             @PathVariable Long reviewId) {
        String userId = SecurityUtils.getCurrentUserId();
        reviewService.deleteReview(productId, reviewId, userId);
        return ResponseEntity.noContent().build();
    }
}
