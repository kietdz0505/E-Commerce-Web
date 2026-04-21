package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.model.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BrandRepository extends JpaRepository<Brand, Long> {

    // Lấy danh sách Brand theo categoryId (List)
    @Query("SELECT DISTINCT b FROM Brand b JOIN b.products p WHERE p.category.id = :categoryId")
    List<Brand> findBrandsByCategoryId(@Param("categoryId") Long categoryId);

    // Lấy danh sách Brand theo categoryId (Pageable)
    @Query("SELECT DISTINCT b FROM Brand b JOIN b.products p WHERE p.category.id = :categoryId")
    Page<Brand> findBrandsByCategoryIdPaged(@Param("categoryId") Long categoryId, Pageable pageable);
}
