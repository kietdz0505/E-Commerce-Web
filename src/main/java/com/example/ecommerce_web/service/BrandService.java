package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.BrandDTO;
import com.example.ecommerce_web.model.Brand;
import com.example.ecommerce_web.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    @Autowired
    private ProductRepository productRepository;

    public List<BrandDTO> getAllBrandsByCategoryId(Long categoryId) {
        List<Brand> brands = productRepository.findBrandsByCategoryId(categoryId);
        return brands.stream()
                .map(b -> new BrandDTO(b.getId(), b.getName(), b.getLogoUrl()))
                .collect(Collectors.toList());
    }

}
