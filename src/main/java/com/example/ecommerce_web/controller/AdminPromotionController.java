package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.service.PromotionService;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/promotions")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class AdminPromotionController {
    private final PromotionService promotionService;

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionDTO dto) {
        PromotionDTO createdPromotion = promotionService.createPromotion(dto);
        return ResponseEntity.ok(createdPromotion);
    }
}