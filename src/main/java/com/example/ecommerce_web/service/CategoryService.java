package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.model.Category;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    List<Category> getAllCategories();
    Category getCategoryById(Long id);
    Category saveCategory(Category category);
    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);
    Long countAllCategories();
}
