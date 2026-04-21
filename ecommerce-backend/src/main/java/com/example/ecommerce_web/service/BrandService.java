package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.BrandDTO;
import com.example.ecommerce_web.model.Brand;
import com.example.ecommerce_web.repository.BrandRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BrandService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private BrandRepository brandRepository;

    // Lấy brands theo categoryId (không phân trang, trả về List)
    public List<BrandDTO> getAllBrandsByCategoryId(Long categoryId) {
        List<Brand> brands = productRepository.findBrandsByCategoryId(categoryId);
        return brands.stream()
                .map(b -> new BrandDTO(b.getId(), b.getName(), b.getLogoUrl()))
                .collect(Collectors.toList());
    }

    // Lấy tất cả brands có phân trang, trả về Page<BrandDTO>
    public Page<BrandDTO> getAllBrands(Pageable pageable) {
        return brandRepository.findAll(pageable)
                .map(b -> new BrandDTO(b.getId(), b.getName(), b.getLogoUrl()));
    }

    public BrandDTO createBrand(BrandDTO brandDTO) {
        Brand brand = new Brand();
        brand.setName(brandDTO.getName());
        brand.setLogoUrl(brandDTO.getLogoUrl());
        Brand saved = brandRepository.save(brand);
        return new BrandDTO(saved.getId(), saved.getName(), saved.getLogoUrl());
    }

    public BrandDTO updateBrand(Long id, BrandDTO brandDTO) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found with id " + id));
        brand.setName(brandDTO.getName());
        brand.setLogoUrl(brandDTO.getLogoUrl());
        Brand updated = brandRepository.save(brand);
        return new BrandDTO(updated.getId(), updated.getName(), updated.getLogoUrl());
    }

    public void deleteBrand(Long id) {
        if (!brandRepository.existsById(id)) {
            throw new RuntimeException("Brand not found with id " + id);
        }
        brandRepository.deleteById(id);
    }
}
