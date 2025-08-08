package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.dto.SimpleProductDTO;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.Promotion;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;

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

    public PromotionDTO createPromotion(PromotionDTO dto) {
        Promotion promotion = new Promotion();
        promotion.setCode(dto.getCode());
        promotion.setDescription(dto.getDescription());
        promotion.setDiscountPercent(dto.getDiscountPercent());

        // Lấy sản phẩm từ DTO (theo id)
        if (dto.getProducts() != null && !dto.getProducts().isEmpty()) {
            List<Product> products = dto.getProducts().stream()
                    .map(p -> productRepository.findById(p.getId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + p.getId())))
                    .collect(Collectors.toList());
            promotion.setProducts(products);
        }

        Promotion saved = promotionRepository.save(promotion);

        // Trả về DTO
        List<SimpleProductDTO> productDTOs = saved.getProducts().stream()
                .map(p -> new SimpleProductDTO(p.getId(), p.getName()))
                .collect(Collectors.toList());

        return new PromotionDTO(saved.getId(), saved.getCode(), saved.getDescription(),
                saved.getDiscountPercent(), productDTOs);
    }

}
