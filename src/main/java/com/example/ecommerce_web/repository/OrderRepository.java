package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(String userId);
    Page<Order> findByUserId(String userId, Pageable pageable);

}
