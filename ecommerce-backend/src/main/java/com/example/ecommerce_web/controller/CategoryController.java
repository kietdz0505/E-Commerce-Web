package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.BrandDTO;
import com.example.ecommerce_web.dto.CategoryDTO;
import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.service.BrandService;
import com.example.ecommerce_web.service.CategoryService;
import com.example.ecommerce_web.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheConfig;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CacheConfig(cacheNames = "categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final ProductService productService;
    private final BrandService brandService;

    @GetMapping
    @Cacheable(key = "'all_list'")
    public List<CategoryDTO> getAllCategories() {
        return categoryService.getAllCategories();
    }

    @GetMapping("/count")
    public Long getCategoryCount() {
        return categoryService.countAllCategories();
    }

    @GetMapping("/{categoryId}/products")
    @Cacheable(key = "'category_' + #categoryId + '_page_' + #page + '_' + #size")
    public Map<String, Object> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> productPage = productService.getProductsByCategory(categoryId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", productPage.getContent());
        response.put("totalElements", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("size", productPage.getSize());
        response.put("number", productPage.getNumber());

        return response;
    }

    @GetMapping("/{categoryId}/brands")
    public List<BrandDTO> getBrandsByCategory(@PathVariable Long categoryId) {
        return brandService.getAllBrandsByCategoryId(categoryId);
    }

    @GetMapping("/{id}")
    @Cacheable(key = "#id", unless = "#result.statusCode.isError()")
    public ResponseEntity<CategoryDTO> getById(@PathVariable Long id) {
        CategoryDTO category = categoryService.getCategoryById(id);
        if (category != null) {
            return ResponseEntity.ok(category);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    @CacheEvict(key = "'all_list'")
    public CategoryDTO create(@RequestBody CategoryDTO categoryDTO) {
        return categoryService.saveCategory(categoryDTO);
    }

    @PutMapping("/{id}")
    @Caching(evict = {
            @CacheEvict(key = "'all_list'"),
            @CacheEvict(key = "#id")
    })
    public ResponseEntity<CategoryDTO> update(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO) {
        CategoryDTO updated = categoryService.updateCategory(id, categoryDTO);
        if (updated != null) {
            return ResponseEntity.ok(updated);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    @Caching(evict = {
            @CacheEvict(key = "'all_list'"),
            @CacheEvict(key = "#id")
    })
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{categoryId}/brands/{brandId}/products")
    @Cacheable(key = "'category_' + #categoryId + '_brand_' + #brandId + '_page_' + #page + '_' + #size")
    public Map<String, Object> getProductsByCategoryAndBrand(
            @PathVariable Long categoryId,
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> productPage = productService.getProductsByCategoryAndBrand(categoryId, brandId, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", productPage.getContent());
        response.put("totalElements", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("size", productPage.getSize());
        response.put("number", productPage.getNumber());

        return response;
    }
}