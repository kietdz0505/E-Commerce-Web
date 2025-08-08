package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(String userId, Pageable pageable);
    Optional<Order> findByIdAndUserId(Long id, String userId);
}
