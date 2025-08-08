package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reports")
@PreAuthorize("hasRole('ADMIN')")
public class AdminReportController {
    private final ReportService reportService;

    public AdminReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/orders")
    public ResponseEntity<Long> getTotalOrders() {
        return ResponseEntity.ok(reportService.getTotalOrders());
    }

    @GetMapping("/revenue")
    public ResponseEntity<Double> getTotalRevenue() {
        return ResponseEntity.ok(reportService.getTotalRevenue());
    }

    @GetMapping("/top-products")
    public ResponseEntity<List<ProductDTO>> getTopSellingProducts() {
        return ResponseEntity.ok(reportService.getTopSellingProducts());
    }
}
