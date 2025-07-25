package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {
}