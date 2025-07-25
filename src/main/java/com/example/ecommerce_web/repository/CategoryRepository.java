package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
