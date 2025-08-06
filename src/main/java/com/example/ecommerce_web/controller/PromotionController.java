package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.service.PromotionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    @GetMapping("/by-products")
    public List<PromotionDTO> getPromotionsByProducts(@RequestParam List<Long> productIds) {
        return promotionService.getPromotionsWithApplicableProducts(productIds);
    }

}
