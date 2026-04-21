package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

import com.example.ecommerce_web.model.Cart;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CartRepository extends JpaRepository<Cart, Long> {
    Optional<Cart> findByUserId(String userId);
}


