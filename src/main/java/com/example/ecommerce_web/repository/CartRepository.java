package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Cart findByUserId(String userId);
}
