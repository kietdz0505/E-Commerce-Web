package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.service.CategoryService;
import com.example.ecommerce_web.service.ProductService;
import com.example.ecommerce_web.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class DashboardController {

    private final ProductService productService;
    private final CategoryService categoryService;
    private final UserService userService;

    @GetMapping("/stats")
    public Map<String, Long> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("products", productService.countAllProducts());
        stats.put("categories", categoryService.countAllCategories());
        stats.put("users", userService.countAllUsers());
        return stats;
    }
}
