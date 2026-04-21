package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.config.PaginationProperties;
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

    private final BrandService brandService;
    private final ProductService productService;
    private final PaginationProperties paginationProperties;

    public BrandController(BrandService brandService, ProductService productService, PaginationProperties paginationProperties) {
        this.brandService = brandService;
        this.productService = productService;
        this.paginationProperties = paginationProperties;
    }

    // Lấy Brand theo categoryId (không phân trang, vì trả về list)
    @GetMapping("/category/{categoryId}")
    public List<BrandDTO> getBrandsByCategory(@PathVariable Long categoryId) {
        return brandService.getAllBrandsByCategoryId(categoryId);
    }

    // Lấy sản phẩm theo brandId với phân trang
    @GetMapping("/{brandId}/products")
    public Page<ProductDTO> getProductsByBrand(
            @PathVariable Long brandId,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        int currentPage = (page != null) ? page : paginationProperties.getDefaultPage();
        int currentSize = (size != null) ? size : paginationProperties.getDefaultPageSize();

        Pageable pageable = PageRequest.of(currentPage, currentSize);
        return productService.getProductsByBrandId(brandId, pageable);
    }


}

