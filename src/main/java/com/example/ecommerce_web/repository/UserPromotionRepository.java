package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Promotion;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.model.UserPromotion;
import com.example.ecommerce_web.model.UserPromotionId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserPromotionRepository extends JpaRepository<UserPromotion, UserPromotionId> {
    List<UserPromotion> findByUser(User user);
    boolean existsByUserAndPromotion(User user, Promotion promotion);
}
