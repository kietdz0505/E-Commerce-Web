package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.BrandDTO;
import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.model.Brand;
import com.example.ecommerce_web.service.BrandService;
import com.example.ecommerce_web.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/brands")
public class BrandController {

    @Autowired
    private BrandService brandService;

    @Autowired
    private ProductService productService;  // Add this

    // Get Brands by Category Id
    @GetMapping("/category/{categoryId}")
    public List<BrandDTO> getBrandsByCategory(@PathVariable Long categoryId) {
        return brandService.getAllBrandsByCategoryId(categoryId);
    }


    // Get Products by Brand Id
    @GetMapping("/{brandId}/products")
    public Page<ProductDTO> getProductsByBrand(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productService.getProductsByBrandId(brandId, pageable);
    }

}
