package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ProductReviewResponse;
import com.example.ecommerce_web.dto.ReviewDTO;
import com.example.ecommerce_web.dto.ReviewRequestDTO;
import com.example.ecommerce_web.mapper.ReviewMapper;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.Review;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.OrderRepository;
import com.example.ecommerce_web.repository.ReviewRepository;
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
import java.util.List;

@RestController
@RequestMapping("/api/products/{productId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final UserService userService;
    private final CloudinaryService cloudinaryService;
    private final OrderRepository orderRepository;
    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;

    @GetMapping
    public ResponseEntity<ProductReviewResponse> getProductReviews(@PathVariable Long productId, @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size, Principal principal) {

        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        User currentUser = null;

        if (principal != null) {

            currentUser = userService.findByIdentity(
                    principal.getName()
            );

        }

        final String currentUserId =
                currentUser != null
                        ? currentUser.getId()
                        : null;

        boolean hasPurchased = false;
        boolean hasReviewed = false;

        ReviewDTO myReview = null;

        if (currentUserId != null) {

            hasPurchased =
                    orderRepository.hasUserPurchasedProduct(
                            currentUserId,
                            productId,
                            List.of(
                                    OrderStatus.SHIPPED,
                                    OrderStatus.COMPLETED
                            )
                    );

            hasReviewed =
                    reviewRepository
                            .existsByUser_IdAndProduct_Id(
                                    currentUserId,
                                    productId
                            );

            myReview = reviewRepository
                    .findByUser_IdAndProduct_Id(
                            currentUserId,
                            productId
                    )
                    .map(review ->
                            reviewMapper.toDTO(
                                    review,
                                    currentUserId
                            )
                    )
                    .orElse(null);
        }

        Page<Review> pageResult =
                reviewRepository.findByProduct_Id(
                        productId,
                        pageable
                );

        List<ReviewDTO> content =
                pageResult.getContent()
                        .stream()
                        .map(review ->
                                reviewMapper.toDTO(
                                        review,
                                        currentUserId
                                )
                        )
                        .toList();

        ProductReviewResponse response =
                new ProductReviewResponse(
                        content,
                        pageResult.getNumber(),
                        pageResult.getSize(),
                        pageResult.getTotalElements(),
                        pageResult.getTotalPages(),
                        pageResult.isLast(),
                        hasPurchased,
                        hasReviewed,
                        myReview
                );

        return ResponseEntity.ok(response);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewDTO> submitReview(@PathVariable Long productId, @RequestParam String comment, @RequestParam int rating, @RequestPart(value = "image", required = false) MultipartFile image, Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userService.findByIdentity(principal.getName());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        ReviewDTO newReview = reviewService.addReview(productId, user.getId(), comment, rating, imageUrl);
        return ResponseEntity.ok(newReview);
    }

    @PutMapping(path = "/{reviewId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ReviewDTO> updateReview(@PathVariable Long productId, @PathVariable Long reviewId, @RequestParam String comment, @RequestParam int rating, @RequestPart(value = "image", required = false) MultipartFile image, Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userService.findByIdentity(principal.getName());

        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = cloudinaryService.uploadImage(image);
        }

        ReviewDTO updatedReview = reviewService.updateReview(productId, reviewId, user.getId(), comment, rating, imageUrl);
        return ResponseEntity.ok(updatedReview);
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> deleteReview(@PathVariable Long productId, @PathVariable Long reviewId, Principal principal) {
        if (principal == null) {
            throw new RuntimeException("Unauthorized");
        }

        User user = userService.findByIdentity(principal.getName());
        reviewService.deleteReview(productId, reviewId, user.getId());
        return ResponseEntity.noContent().build();
    }
}
