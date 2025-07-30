package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.mapper.ProductMapper;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;


public interface ProductService {

    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);
    List<ProductDTO> getAllProducts();
    Page<ProductDTO> getAllProducts(Pageable pageable);
    ProductDTO getProductById(Long id);
    ProductDTO createProduct(ProductDTO dto);
    void deleteProduct(Long id);
    Long countAllProducts();
}
