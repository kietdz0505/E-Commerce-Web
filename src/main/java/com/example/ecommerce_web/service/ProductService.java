package com.example.ecommerce_web.service;
import com.example.ecommerce_web.dto.ProductDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface ProductService {

    Page<ProductDTO> getProductsByCategory(Long categoryId, Pageable pageable);
    List<ProductDTO> getAllProducts();
    Page<ProductDTO> getAllProducts(Pageable pageable);
    ProductDTO getProductById(Long id);
    ProductDTO createProduct(ProductDTO dto);
    void deleteProduct(Long id);
    Long countAllProducts();
    Page<ProductDTO> searchProducts(String name, Long brandId, Double minPrice, Double maxPrice, Integer minRating, Pageable pageable);
    List<String> autocompleteProductNames(String query);


}
