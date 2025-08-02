package com.example.ecommerce_web.service.impl;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.mapper.ProductMapper;

import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.repository.BrandRepository;

import com.example.ecommerce_web.repository.CategoryRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductServiceImpl implements ProductService {
    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;


    @Autowired
    public ProductServiceImpl(ProductRepository productRepository,
                              BrandRepository brandRepository,
                              CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.brandRepository = brandRepository;
        this.categoryRepository = categoryRepository;
    }



    @Override
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(ProductMapper::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findProductsByCategoryId(categoryId, pageable)
                .map(ProductMapper::toDTO);
    }

    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(ProductMapper::toDTO);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(ProductMapper::toDTO)
                .orElse(null);
    }

    @Override
    public Long countAllProducts() {
        return productRepository.count();
    }

    @Override
    public ProductDTO createProduct(ProductDTO dto) {
        Product product = ProductMapper.toEntity(dto);
        product.setBrand(brandRepository.findById(dto.getBrandId()).orElse(null));
        product.setCategory(categoryRepository.findById(dto.getCategoryId()).orElse(null));
        return ProductMapper.toDTO(productRepository.save(product));
    }

    @Override
    public Page<ProductDTO> getProductsByCategoryAndBrand(Long categoryId, Long brandId, Pageable pageable) {
        return productRepository.findProductsByCategoryAndBrand(categoryId, brandId, pageable)
                .map(ProductMapper::toDTO);
    }



    @Override
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    // Autocomplete Product Names
    @Override
    public List<String> autocompleteProductNames(String query) {
        return productRepository.findTop10ByNameContainingIgnoreCase(query)
                .stream().map(Product::getName).collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> getProductsByBrandId(Long brandId, Pageable pageable) {
        return productRepository.findProductsByBrandId(brandId, pageable)
                .map(ProductMapper::toDTO);
    }
    // Search Products with Filters

    @Override
    public Page<ProductDTO> searchProducts(String keyword, Double minPrice, Double maxPrice, Integer minRating, Pageable pageable) {
        Page<Product> products = productRepository.searchProducts(keyword, minPrice, maxPrice, minRating, pageable);
        return products.map(ProductMapper::toDTO);
    }





}
