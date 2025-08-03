package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ReviewDTO;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.Review;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.ReviewRepository;
import com.example.ecommerce_web.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private UserRepository userRepository;

    public Page<ReviewDTO> getReviewsByProduct(Long productId, Pageable pageable, String currentUserId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Page<Review> reviews = reviewRepository.findByProduct(product, pageable);

        return reviews.map(review -> {
            boolean owner = currentUserId != null && review.getUser().getId().equals(currentUserId);
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



    public ReviewDTO addReview(Long productId, String userId, String comment, int rating, String imageUrl) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
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
                true  // isOwner = true vì user đang tạo review
        );
    }

    public void deleteReview(Long productId, Long reviewId, String userId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Review does not belong to this product");
        }

        if (!review.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new RuntimeException("You are not authorized to delete this review");
        }

        reviewRepository.delete(review);
    }

    public ReviewDTO updateReview(Long productId, Long reviewId, String userId, String comment, int rating, String imageUrl) {
        if (rating < 1 || rating > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));

        if (!review.getProduct().getId().equals(productId)) {
            throw new RuntimeException("Review does not belong to this product");
        }

        if (!review.getUser().getId().equals(userId) && !isAdmin(userId)) {
            throw new RuntimeException("You are not authorized to edit this review");
        }

        review.setComment(comment);
        review.setRating(rating);
        review.setImageUrl(imageUrl);
        reviewRepository.save(review);

        return new ReviewDTO(
                review.getId(),
                review.getComment(),
                review.getRating(),
                review.getImageUrl(),
                review.getUser().getName(),
                review.getUser().getPicture(),
                review.getCreatedAt(),
                true  // isOwner = true vì user đang chỉnh sửa review của mình
        );
    }

    private boolean isAdmin(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return user.isAdmin();
    }

}
