package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}