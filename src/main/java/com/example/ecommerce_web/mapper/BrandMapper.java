package com.example.ecommerce_web.mapper;

import com.example.ecommerce_web.dto.BrandDTO;
import com.example.ecommerce_web.model.Brand;

public class BrandMapper {
    public static BrandDTO toDTO(Brand brand) {
        BrandDTO dto = new BrandDTO();
        dto.setId(brand.getId());
        dto.setName(brand.getName());
        dto.setLogoUrl(brand.getLogoUrl());
        return dto;
    }
}
