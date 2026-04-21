package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.config.PaginationProperties;
import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.service.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class ProductController {

    private final ProductService productService;
    private final PaginationProperties paginationProperties;

    public ProductController(ProductService productService, PaginationProperties paginationProperties) {
        this.productService = productService;
        this.paginationProperties = paginationProperties;
    }

    @GetMapping
    public Map<String, Object> getAll(@RequestParam(required = false) Integer page,
                                      @RequestParam(required = false) Integer size) {
        int currentPage = (page != null) ? page : paginationProperties.getDefaultPage();
        int pageSize = (size != null) ? size : paginationProperties.getDefaultPageSize();

        Pageable pageable = PageRequest.of(currentPage, pageSize);
        Page<ProductDTO> productPage = productService.getAllProducts(pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", productPage.getContent());
        response.put("totalElements", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        response.put("size", productPage.getSize());
        response.put("number", productPage.getNumber());  // current page number (zero-based)

        return response;
    }

    @GetMapping("/{id}")
    public ProductDTO getById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PostMapping
    public ProductDTO create(@RequestBody ProductDTO dto) {
        return productService.createProduct(dto);
    }

    @GetMapping("/count")
    public Long getProductCount() {
        return productService.countAllProducts();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        productService.deleteProduct(id);
    }


    @GetMapping("/search")
    public Map<String, Object> searchProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Double minPrice,
            @RequestParam(required = false) Double maxPrice,
            @RequestParam(required = false) Integer minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ProductDTO> productPage = productService.searchProducts(keyword, minPrice, maxPrice, minRating, pageable);

        Map<String, Object> response = new HashMap<>();
        response.put("content", productPage.getContent());
        response.put("totalElements", productPage.getTotalElements());
        response.put("totalPages", productPage.getTotalPages());
        return response;
    }



    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocompleteProductNames(@RequestParam(required = false) String query) {
        if (query == null || query.trim().isEmpty()) {
            return ResponseEntity.ok(List.of());
        }
        List<String> suggestions = productService.autocompleteProductNames(query);
        return ResponseEntity.ok(suggestions);
    }



}
