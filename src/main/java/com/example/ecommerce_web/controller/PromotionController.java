package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.service.PromotionService;
import com.example.ecommerce_web.service.UserPromotionService;
import com.example.ecommerce_web.service.UserService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;


@AllArgsConstructor
@Setter
@Getter
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;
    private final UserService userService;
    private final UserPromotionService userPromotionService;



    @GetMapping("/by-products")
    public List<PromotionDTO> getPromotionsByProducts(@RequestParam List<Long> productIds) {
        return promotionService.getPromotionsWithApplicableProducts(productIds);
    }

    @GetMapping("/claim")
    public String claimPromotion(@RequestParam String email,
                                 @RequestParam Long promotionId) {
        User user = userService.findByEmail(email);
        Promotion promotion = promotionService.getById(promotionId);

        UserPromotionId upId = new UserPromotionId(user.getId(), promotion.getId());
        UserPromotion userPromotion = userPromotionService.getUserPromotion(upId)
                .orElseThrow(() -> new RuntimeException("Promotion not sent to user"));

        if (userPromotion.getStatus() != PromotionStatus.CLICKED) {
            userPromotion.setStatus(PromotionStatus.CLICKED);
            userPromotion.setClickedAt(LocalDateTime.now());
            userPromotionService.save(userPromotion);
            return "Promotion claimed successfully!";
        }

        return "Promotion already claimed!";
    }

}
