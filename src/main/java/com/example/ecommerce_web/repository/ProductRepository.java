package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Bạn có thể thêm hàm tùy chỉnh nếu cần, ví dụ:
    List<Product> findByNameContaining(String keyword);
}
