package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}
