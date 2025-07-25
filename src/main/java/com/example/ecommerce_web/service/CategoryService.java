package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.Category;
import com.example.ecommerce_web.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    public Category getCategoryById(Long id) {
        return categoryRepository.findById(id).orElse(null);
    }
    public Category saveCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Long countAllCategories() {
        return categoryRepository.count();
    }


}