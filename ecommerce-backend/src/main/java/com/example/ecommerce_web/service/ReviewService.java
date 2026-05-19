package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.AdminReviewDTO;
import com.example.ecommerce_web.dto.ReviewDTO;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.Review;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.OrderRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.ReviewRepository;
import com.example.ecommerce_web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;

    private final OrderRepository orderRepository;

    private final ProductRepository productRepository;

    private final UserRepository userRepository;

    public Page<ReviewDTO> getReviewsByProduct(
            Long productId,
            Pageable pageable,
            String currentUserId
    ) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Page<Review> reviews =
                reviewRepository.findByProduct_Id(product.getId(), pageable);

        return reviews.map(review -> {

            boolean owner =
                    currentUserId != null &&
                            review.getUser().getId().equals(currentUserId);

            return new ReviewDTO(
                    review.getId(),
                    review.getComment(),
                    review.getRating(),
                    review.getImageUrl(),
                    review.getUser().getName(),
                    review.getUser().getPicture(),
                    review.getCreatedAt(),
                    owner
            );
        });
    }

    public ReviewDTO addReview(
            Long productId,
            String userId,
            String comment,
            int rating,
            String imageUrl
    ) {

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5"
            );
        }

        boolean hasPurchased =
                orderRepository.hasUserPurchasedProduct(
                        userId,
                        productId,
                        List.of(
                                OrderStatus.SHIPPED,
                                OrderStatus.COMPLETED
                        )
                );

        if (!hasPurchased) {
            throw new RuntimeException(
                    "You must purchase this product before reviewing"
            );
        }

        boolean alreadyReviewed =
                reviewRepository.existsByUser_IdAndProduct_Id(
                        userId,
                        productId
                );

        if (alreadyReviewed) {
            throw new RuntimeException(
                    "You have already reviewed this product"
            );
        }

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Review review = Review.builder()
                .comment(comment)
                .rating(rating)
                .imageUrl(imageUrl)
                .user(user)
                .product(product)
                .createdAt(LocalDateTime.now())
                .build();

        Review savedReview = reviewRepository.save(review);

        return new ReviewDTO(
                savedReview.getId(),
                savedReview.getComment(),
                savedReview.getRating(),
                savedReview.getImageUrl(),
                user.getName(),
                user.getPicture(),
                savedReview.getCreatedAt(),
                true
        );
    }

    public void deleteReview(
            Long productId,
            Long reviewId,
            String userId
    ) {

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getProduct().getId().equals(productId)) {
            throw new RuntimeException(
                    "Review does not belong to this product"
            );
        }

        if (
                !review.getUser().getId().equals(userId)
                        && !isAdmin(userId)
        ) {
            throw new RuntimeException(
                    "You are not authorized to delete this review"
            );
        }

        reviewRepository.delete(review);
    }

    public ReviewDTO updateReview(
            Long productId,
            Long reviewId,
            String userId,
            String comment,
            int rating,
            String imageUrl
    ) {

        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException(
                    "Rating must be between 1 and 5"
            );
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getProduct().getId().equals(productId)) {
            throw new RuntimeException(
                    "Review does not belong to this product"
            );
        }

        if (
                !review.getUser().getId().equals(userId)
                        && !isAdmin(userId)
        ) {
            throw new RuntimeException(
                    "You are not authorized to edit this review"
            );
        }

        review.setComment(comment);
        review.setRating(rating);

        if (imageUrl != null) {
            review.setImageUrl(imageUrl);
        }

        reviewRepository.save(review);

        return new ReviewDTO(
                review.getId(),
                review.getComment(),
                review.getRating(),
                review.getImageUrl(),
                review.getUser().getName(),
                review.getUser().getPicture(),
                review.getCreatedAt(),
                true
        );
    }

    private boolean isAdmin(String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return user.isAdmin();
    }

    public Page<AdminReviewDTO> getReviewsByProductIdForAdmin(
            Long productId,
            Pageable pageable
    ) {

        Page<Review> reviewPage =
                reviewRepository.findByProduct_Id(productId, pageable);

        return reviewPage.map(review -> new AdminReviewDTO(
                review.getId(),
                review.getComment(),
                review.getRating(),
                review.getImageUrl(),
                review.getUser().getId(),
                review.getUser().getName(),
                review.getUser().getPicture(),
                review.getCreatedAt()
        ));
    }
}