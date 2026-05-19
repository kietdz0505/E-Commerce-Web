package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    // reviews theo product
    Page<Review> findByProduct_Id(Long productId, Pageable pageable);

    // user đã review product chưa
    boolean existsByUser_IdAndProduct_Id(String userId, Long productId);

    // lấy review của user cho product
    Optional<Review> findByUser_IdAndProduct_Id(String userId, Long productId);

    // tổng review
    Long countByProduct_Id(Long productId);

    // average rating
    @Query("""
        SELECT AVG(r.rating)
        FROM Review r
        WHERE r.product.id = :productId
    """)
    Double findAverageRatingByProductId(@Param("productId") Long productId);
}