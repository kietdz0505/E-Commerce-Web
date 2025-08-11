package com.example.ecommerce_web.service.impl;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.dto.SimpleProductDTO;
import com.example.ecommerce_web.mapper.ProductMapper;
import com.example.ecommerce_web.model.Brand;
import com.example.ecommerce_web.model.Category;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.repository.BrandRepository;
import com.example.ecommerce_web.repository.CategoryRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.ReviewRepository;
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

    @Autowired
    private ReviewRepository reviewRepository;

    @Override
    public Page<ProductDTO> getAllProducts(Pageable pageable) {
        return productRepository.findAll(pageable)
                .map(this::enrichProductWithReview);
    }

    @Override
    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .map(this::enrichProductWithReview)
                .collect(Collectors.toList());
    }

    @Override
    public Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findProductsByCategoryId(categoryId, pageable)
                .map(ProductMapper::toDTO);
    }

    @Override
    public ProductDTO getProductById(Long id) {
        return productRepository.findById(id)
                .map(this::enrichProductWithReview)
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
        Product saved = productRepository.save(product);
        return enrichProductWithReview(saved);
    }

    @Override
    public Page<ProductDTO> getProductsByCategoryAndBrand(Long categoryId, Long brandId, Pageable pageable) {
        return productRepository.findProductsByCategoryAndBrand(categoryId, brandId, pageable)
                .map(ProductMapper::toDTO);
    }

    @Override
    public void deleteProduct(Long id) {
        if (!productRepository.existsById(id)) {
            throw new RuntimeException("Product not found with id: " + id);
        }
        productRepository.deleteById(id);
    }

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

    @Override
    public Page<ProductDTO> searchProducts(String keyword, Double minPrice, Double maxPrice, Integer minRating, Pageable pageable) {
        return productRepository.searchProducts(keyword, minPrice, maxPrice, minRating, pageable)
                .map(this::enrichProductWithReview);
    }

    private ProductDTO enrichProductWithReview(Product product) {
        ProductDTO dto = ProductMapper.toDTO(product);
        Long count = reviewRepository.countByProductId(product.getId());
        Double avg = reviewRepository.findAverageRatingByProductId(product.getId());
        dto.setReviewCount(count != null ? count : 0L);
        dto.setAverageRating(avg != null ? avg : 0.0);
        return dto;
    }

    private ProductDTO mapToDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setImageUrl(product.getImageUrl());
        dto.setPrice(product.getPrice());
        dto.setStock(product.getStock());
        dto.setAvailable(product.isAvailable());
        dto.setBrandId(product.getBrand() != null ? product.getBrand().getId() : null);
        dto.setBrandName(product.getBrand() != null ? product.getBrand().getName() : null);
        dto.setCategoryId(product.getCategory() != null ? product.getCategory().getId() : null);
        dto.setCategoryName(product.getCategory() != null ? product.getCategory().getName() : null);
        dto.setAverageRating(product.getAverageRating());
        dto.setReviewCount(product.getReviewCount());
        return dto;
    }

    private SimpleProductDTO mapToSimpleDTO(Product product){
        SimpleProductDTO dto = new SimpleProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        return dto;
    }

    @Override
    public ProductDTO updateProduct(Long id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));

        if (dto.getBrandId() != null) {
            Brand brand = brandRepository.findById(dto.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Brand not found with id: " + dto.getBrandId()));
            product.setBrand(brand);
        }

        if (dto.getCategoryId() != null) {
            Category category = categoryRepository.findById(dto.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + dto.getCategoryId()));
            product.setCategory(category);
        }

        product.setName(dto.getName());
        product.setDescription(dto.getDescription());
        product.setImageUrl(dto.getImageUrl());
        product.setPrice(dto.getPrice());
        product.setStock(dto.getStock());
        product.setAvailable(dto.isAvailable());

        Product updated = productRepository.save(product);
        return mapToDTO(updated);
    }


    @Override
    public List<SimpleProductDTO> searchSimpleProducts(String keyword) {
        return productRepository
                .findByNameContainingIgnoreCase(keyword)
                .stream()
                .map(this::mapToSimpleDTO)
                .toList();
    }


}
