package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.config.PaginationProperties;
import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.dto.UserPromotionDTO;
import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.security.CustomUserDetails;
import com.example.ecommerce_web.service.PromotionService;
import com.example.ecommerce_web.service.UserPromotionService;
import com.example.ecommerce_web.service.UserService;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;


@AllArgsConstructor
@Setter
@Getter
@RestController
@RequestMapping("/api/promotions")
public class PromotionController {

    private final PromotionService promotionService;
    private final UserService userService;
    private final UserPromotionService userPromotionService;
    private final PaginationProperties paginationProperties;


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

    @GetMapping("/my")
    public ResponseEntity<?> getMyPromotions(
            Authentication authentication,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User user = userService.findById(userDetails.getUserId());

        // Nếu client không truyền page/size thì lấy mặc định từ app.prop
        int currentPage = (page != null) ? page : paginationProperties.getDefaultPage();
        int pageSize = (size != null) ? size : paginationProperties.getDefaultPageSize();

        Pageable pageable = PageRequest.of(currentPage, pageSize, Sort.by("sentAt").descending());

        Page<UserPromotionDTO> response = promotionService.getPromotionsForUser(user, pageable)
                .map(up -> new UserPromotionDTO(
                        up.getPromotion().getId(),
                        up.getPromotion().getCode(),
                        up.getPromotion().getDescription(),
                        up.getPromotion().getDiscountPercent(),
                        up.getPromotion().getValidFrom(),
                        up.getPromotion().getValidTo(),
                        up.getPromotion().isActive(),
                        up.getStatus(),
                        up.getSentAt(),
                        up.getViewedAt(),
                        up.getClickedAt()
                ));

        return ResponseEntity.ok(response);
    }


}
