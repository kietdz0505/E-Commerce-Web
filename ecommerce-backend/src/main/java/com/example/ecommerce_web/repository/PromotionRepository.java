package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    Optional<Promotion> findByCode(String code);
    @Query("SELECT DISTINCT p FROM Promotion p JOIN p.products prod WHERE prod.id IN :productIds")
    List<Promotion> findAllByProductIds(@Param("productIds") List<Long> productIds);

}
