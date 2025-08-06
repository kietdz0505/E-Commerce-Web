package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.dto.SimpleProductDTO;
import com.example.ecommerce_web.model.Promotion;
import com.example.ecommerce_web.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public List<PromotionDTO> getPromotionsWithApplicableProducts(List<Long> productIds) {
        List<Promotion> promotions = promotionRepository.findAllByProductIds(productIds);
        return promotions.stream().map(promo -> new PromotionDTO(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getDiscountPercent(),
                promo.getProducts().stream()
                        .map(prod -> new SimpleProductDTO(prod.getId(), prod.getName()))
                        .collect(Collectors.toList())
        )).collect(Collectors.toList());
    }

}
