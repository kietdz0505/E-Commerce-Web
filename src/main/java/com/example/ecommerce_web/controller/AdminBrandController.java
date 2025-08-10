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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/brands")
public class AdminBrandController {

    private final BrandService brandService;
    private final ProductService productService;
    private final PaginationProperties paginationProperties;

    public AdminBrandController(BrandService brandService, ProductService productService, PaginationProperties paginationProperties) {
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

    @GetMapping
    public Page<BrandDTO> getAllBrands(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        int currentPage = (page != null) ? page : paginationProperties.getDefaultPage();
        int currentSize = (size != null) ? size : paginationProperties.getDefaultPageSize();

        Pageable pageable = PageRequest.of(currentPage, currentSize);
        return brandService.getAllBrands(pageable);
    }

    // Thêm brand mới
    @PostMapping
    public BrandDTO createBrand(@RequestBody BrandDTO brandDTO) {
        return brandService.createBrand(brandDTO);
    }

    // Sửa brand theo id
    @PutMapping("/{id}")
    public BrandDTO updateBrand(@PathVariable Long id, @RequestBody BrandDTO brandDTO) {
        return brandService.updateBrand(id, brandDTO);
    }

    // Xóa brand theo id
    @DeleteMapping("/{id}")
    public void deleteBrand(@PathVariable Long id) {
        brandService.deleteBrand(id);
    }



}

