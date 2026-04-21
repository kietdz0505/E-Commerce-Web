package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.CategoryDTO;
import com.example.ecommerce_web.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CategoryService {
    List<CategoryDTO> getAllCategories();

    CategoryDTO getCategoryById(Long id);

    CategoryDTO saveCategory(CategoryDTO categoryDTO);

    CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO);

    boolean deleteCategory(Long id);

    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);

    Long countAllCategories();

    Page<CategoryDTO> getAllCategoriesPaged(Pageable pageable);
}


