package com.example.ecommerce_web.service.impl;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.mapper.ProductMapper;
import com.example.ecommerce_web.model.Category;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.repository.CategoryRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.service.CategoryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Override
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }

    @Override
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    @Override
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        Page<Product> products = productRepository.findByCategoryId(categoryId, pageable);
        return products.map(ProductMapper::toDTO);
    }

    @Override
    public Long countAllCategories() {
        return categoryRepository.count();
    }
}
