package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.BrandDTO;
import com.example.ecommerce_web.dto.CategoryDTO;
import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.mapper.CategoryMapper;
import com.example.ecommerce_web.model.Brand;
import com.example.ecommerce_web.model.Category;
import com.example.ecommerce_web.service.BrandService;
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
    private final ProductService productService;
    private final BrandService brandService;

    @GetMapping
    public List<CategoryDTO> getAllCategories() {
        return categoryService.getAllCategories();
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

    @GetMapping("/{categoryId}/brands")
    public List<BrandDTO> getBrandsByCategory(@PathVariable Long categoryId) {
        return brandService.getAllBrandsByCategoryId(categoryId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getById(@PathVariable Long id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        if (category != null) {
            return ResponseEntity.ok(category);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public CategoryDTO create(@RequestBody CategoryDTO categoryDTO) {
        return categoryService.saveCategory(categoryDTO);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDTO> update(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = categoryService.updateCategory(id, categoryDTO);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}/brands/{brandId}/products")
    public Page<ProductDTO> getProductsByCategoryAndBrand(
            @PathVariable Long categoryId,
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return productService.getProductsByCategoryAndBrand(categoryId, brandId, pageable);
    }


}
