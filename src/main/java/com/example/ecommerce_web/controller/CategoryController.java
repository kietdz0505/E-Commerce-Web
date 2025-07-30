package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.model.Category;
import com.example.ecommerce_web.service.CategoryService;
import com.example.ecommerce_web.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductService productService; //

    @GetMapping
    public List<Category> getAll() {
        return categoryService.getAllCategories();
    }

    @PostMapping
    public Category create(@RequestBody Category category) {
        return categoryService.saveCategory(category);
    }

    @GetMapping("/count")
    public Long getCategoryCount() {
        return categoryService.countAllCategories();
    }

    @GetMapping("/{categoryId}/products")
    public Page<ProductDTO> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.getProductsByCategory(categoryId, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Category> getById(@PathVariable Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category != null) {
            return ResponseEntity.ok(category);
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}
