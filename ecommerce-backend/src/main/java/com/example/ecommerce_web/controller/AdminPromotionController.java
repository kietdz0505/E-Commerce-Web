package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.config.PaginationProperties;
import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.service.PromotionService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/promotions")
@PreAuthorize("hasRole('ADMIN')")
@AllArgsConstructor
public class AdminPromotionController {
    private final PromotionService promotionService;
    private final PaginationProperties paginationProperties;

    @PostMapping
    public ResponseEntity<PromotionDTO> createPromotion(@RequestBody PromotionDTO dto) {
        PromotionDTO createdPromotion = promotionService.createPromotion(dto);
        return ResponseEntity.ok(createdPromotion);
    }

    @GetMapping
    public ResponseEntity<Page<PromotionDTO>> getAllPromotions(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        int currentPage = (page != null) ? page : paginationProperties.getDefaultPage();
        int currentSize = (size != null) ? size : paginationProperties.getDefaultPageSize();

        Pageable pageable = PageRequest.of(currentPage, currentSize);

        Page<PromotionDTO> promotions = promotionService.getAllPromotions(pageable);
        return ResponseEntity.ok(promotions);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PromotionDTO> updatePromotion(
            @PathVariable Long id,
            @RequestBody PromotionDTO dto) {
        PromotionDTO updated = promotionService.updatePromotion(id, dto);
        return ResponseEntity.ok(updated);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.noContent().build();
    }


}