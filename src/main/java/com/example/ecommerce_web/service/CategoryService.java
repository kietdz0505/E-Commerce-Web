package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.mapper.ProductMapper;
import com.example.ecommerce_web.model.Category;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.repository.CategoryRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> products = productRepository.findByCategoryId(categoryId, pageable);
        return products.map(ProductMapper::toDTO);
    }
    public Long countAllCategories() {
        return categoryRepository.count();
    }


}