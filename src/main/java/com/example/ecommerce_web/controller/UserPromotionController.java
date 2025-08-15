package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.model.Promotion;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.service.PromotionService;
import com.example.ecommerce_web.service.UserPromotionService;
import com.example.ecommerce_web.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("hasRole('ADMIN')")
@RequestMapping("/api/admin/user-promotions")
@RequiredArgsConstructor
public class UserPromotionController {

    @Autowired
    private final UserPromotionService userPromotionService;
    private final PromotionService promotionService;

    @Value("${app.base-url}")
    private String baseUrl;

    /**
     * Gửi khuyến mãi cho tất cả user
     */
    @PostMapping("/send-all/{promotionId}")
    public String sendPromotionToAll(@PathVariable Long promotionId) {
        Promotion promo = promotionService.getById(promotionId);
        userPromotionService.sendPromotionToAllUsers(promo, baseUrl);
        return "Promotion sent to all users!";
    }

    /**
     * Gửi khuyến mãi cho 1 user qua email
     */
    @PostMapping("/send-one/{promotionId}")
    public String sendPromotionToOne(@PathVariable Long promotionId, @RequestParam String email) {
        Promotion promo = promotionService.getById(promotionId);
        email = email.trim();

        try {
            userPromotionService.sendPromotionToUserByEmail(email, promo, baseUrl);
            return "Promotion sent to " + email;
        } catch (RuntimeException ex) {
            return ex.getMessage(); // sẽ trả "User not found with email: ..."
        }
    }

}
