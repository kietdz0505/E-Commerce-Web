package com.example.ecommerce_web.service;
import com.example.ecommerce_web.dto.PromotionDTO;
import com.example.ecommerce_web.dto.SimpleProductDTO;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.Promotion;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.PromotionRepository;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Getter
@Setter
public class PromotionService {

    private final PromotionRepository promotionRepository;
    private final ProductRepository productRepository;

    public List<PromotionDTO> getPromotionsWithApplicableProducts(List<Long> productIds) {
        LocalDateTime now = LocalDateTime.now();

        List<Promotion> promotions = promotionRepository.findAllByProductIds(productIds)
                .stream()
                .filter(promo ->
                        promo.getValidFrom() != null && promo.getValidTo() != null &&
                                !now.isBefore(promo.getValidFrom()) && !now.isAfter(promo.getValidTo())
                )
                .collect(Collectors.toList());

        return promotions.stream().map(promo -> new PromotionDTO(
                promo.getId(),
                promo.getCode(),
                promo.getDescription(),
                promo.getDiscountPercent(),
                promo.getUsageLimit(),
                promo.getValidFrom(),
                promo.getValidTo(),
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
        promotion.setUsageLimit(dto.getUsageLimit());
        promotion.setValidFrom(dto.getValidFrom());
        promotion.setValidTo(dto.getValidTo());

        // Lấy sản phẩm từ DTO (theo id)
        if (dto.getProducts() != null && !dto.getProducts().isEmpty()) {
            List<Product> products = dto.getProducts().stream()
                    .map(p -> productRepository.findById(p.getId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + p.getId())))
                    .collect(Collectors.toList());
            promotion.setProducts(products);
        } else {
            promotion.setProducts(new ArrayList<>()); // tránh null
        }

        Promotion saved = promotionRepository.save(promotion);

        // Map lại thành AdminPromotionDTO để trả về
        List<SimpleProductDTO> productDTOs = saved.getProducts().stream()
                .map(p -> new SimpleProductDTO(p.getId(), p.getName()))
                .collect(Collectors.toList());

        PromotionDTO response = new PromotionDTO();
        response.setId(saved.getId());
        response.setCode(saved.getCode());
        response.setDescription(saved.getDescription());
        response.setDiscountPercent(saved.getDiscountPercent());
        response.setUsageLimit(saved.getUsageLimit());
        response.setValidFrom(saved.getValidFrom());
        response.setValidTo(saved.getValidTo());
        response.setProducts(productDTOs);

        return response;
    }

    public Page<PromotionDTO> getAllPromotions(Pageable pageable) {
        Page<Promotion> page = promotionRepository.findAll(pageable);
        return page.map(this::toDTO);
    }

    private PromotionDTO toDTO(Promotion promotion) {
        List<SimpleProductDTO> productDTOs = promotion.getProducts().stream()
                .map(p -> new SimpleProductDTO(p.getId(), p.getName()))
                .collect(Collectors.toList());

        return new PromotionDTO(
                promotion.getId(),
                promotion.getCode(),
                promotion.getDescription(),
                promotion.getDiscountPercent(),
                promotion.getUsageLimit(),
                promotion.getValidFrom(),
                promotion.getValidTo(),
                productDTOs
        );
    }

    public PromotionDTO updatePromotion(Long id, PromotionDTO dto) {
        Promotion promotion = promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));

        // Cập nhật các field cơ bản
        if (dto.getCode() != null) {
            promotion.setCode(dto.getCode());
        }
        if (dto.getDescription() != null) {
            promotion.setDescription(dto.getDescription());
        }
        if (dto.getDiscountPercent() != null) {
            promotion.setDiscountPercent(dto.getDiscountPercent());
        }
        if (dto.getUsageLimit() != null) {
            promotion.setUsageLimit(dto.getUsageLimit());
        }
        if (dto.getValidFrom() != null) {
            promotion.setValidFrom(dto.getValidFrom());
        }
        if (dto.getValidTo() != null) {
            promotion.setValidTo(dto.getValidTo());
        }

        // Cập nhật sản phẩm áp dụng
        if (dto.getProducts() != null) {
            List<Product> newProducts = dto.getProducts().stream()
                    .map(p -> productRepository.findById(p.getId())
                            .orElseThrow(() -> new RuntimeException("Product not found with id: " + p.getId())))
                    .collect(Collectors.toCollection(ArrayList::new)); // mutable

            promotion.getProducts().clear(); // clear list cũ
            promotion.getProducts().addAll(newProducts); // thêm list mới
        }

        Promotion updated = promotionRepository.save(promotion);

        // Map về DTO
        List<SimpleProductDTO> productDTOs = updated.getProducts().stream()
                .map(p -> new SimpleProductDTO(p.getId(), p.getName()))
                .collect(Collectors.toList());

        return new PromotionDTO(
                updated.getId(),
                updated.getCode(),
                updated.getDescription(),
                updated.getDiscountPercent(),
                updated.getUsageLimit(),
                updated.getValidFrom(),
                updated.getValidTo(),
                productDTOs
        );
    }

    public void deletePromotion(Long id) {
        if (!promotionRepository.existsById(id)) {
            throw new RuntimeException("Promotion not found with id: " + id);
        }
        promotionRepository.deleteById(id);
    }

    public Promotion getById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Promotion not found with id: " + id));
    }

}
