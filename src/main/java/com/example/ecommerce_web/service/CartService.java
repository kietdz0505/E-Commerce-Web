package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.CartItemDTO;
import com.example.ecommerce_web.dto.CartResponseDTO;
import com.example.ecommerce_web.dto.ProductDTO;
import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.model.Cart;
import com.example.ecommerce_web.model.CartItem;
import com.example.ecommerce_web.model.Product;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.CartItemRepository;
import com.example.ecommerce_web.repository.CartRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.UserRepository;
import com.example.ecommerce_web.util.SecurityUtils;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartRepository cartRepository, CartItemRepository cartItemRepository,
                       ProductRepository productRepository, UserRepository userRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public Cart getCartForUser(String userId) {
        return cartRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Cart newCart = new Cart();
                    newCart.setUser(user);
                    return cartRepository.save(newCart);
                });
    }

    public List<CartItemDTO> getCartItems(String userId) {
        Cart cart = getCartForUser(userId);
        return cart.getItems().stream()
                .map(this::convertToCartItemDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CartItem addItemToCart(String userId, Long productId, int quantity) {
        Cart cart = getCartForUser(userId);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(productId))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + quantity);
            return cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = new CartItem();
            newItem.setCart(cart);
            newItem.setProduct(product);
            newItem.setQuantity(quantity);
            newItem.setPrice(product.getPrice());
            return cartItemRepository.save(newItem);
        }
    }

    @Transactional
    public void removeItemFromCart(String userId, Long cartItemId) {
        Cart cart = getCartForUser(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Unauthorized action");
        }

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public CartItem updateCartItemQuantity(String userId, Long cartItemId, int newQuantity) {
        Cart cart = getCartForUser(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("CartItem not found"));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Unauthorized action");
        }

        cartItem.setQuantity(newQuantity);
        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void clearCart(String userId) {
        Cart cart = getCartForUser(userId);
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);
    }

    public Double calculateCartTotal(String userId) {
        Cart cart = getCartForUser(userId);
        return cart.getItems().stream()
                .mapToDouble(item -> item.getPrice() * item.getQuantity())
                .sum();
    }

    public CartResponseDTO convertToCartResponseDTO(Cart cart) {
        CartResponseDTO dto = new CartResponseDTO();
        dto.setId(cart.getId());

        // Map User -> UserDTO
        User user = cart.getUser();
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setPicture(user.getPicture());
        userDTO.setPhone(user.getPhone());
        userDTO.setAddress(user.getAddress());
        userDTO.setGender(user.getGender());
        userDTO.setDob(user.getDob());
        userDTO.setAuthProvider(user.getAuthProvider());
        userDTO.setRoles(user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()));
        dto.setUser(userDTO);

        // Map Cart Items -> CartItemDTO list
        dto.setItems(cart.getItems().stream().map(item -> {
            CartItemDTO itemDTO = new CartItemDTO();
            itemDTO.setId(item.getId());
            itemDTO.setQuantity(item.getQuantity());
            itemDTO.setPrice(item.getPrice());

            Product product = item.getProduct();
            ProductDTO productDTO = new ProductDTO();
            productDTO.setId(product.getId());
            productDTO.setName(product.getName());
            productDTO.setDescription(product.getDescription());
            productDTO.setImageUrl(product.getImageUrl());
            productDTO.setPrice(product.getPrice());
            productDTO.setStock(product.getStock());
            productDTO.setAvailable(product.isAvailable());
            productDTO.setBrandId(product.getBrand().getId());
            productDTO.setBrandName(product.getBrand().getName());
            productDTO.setAverageRating(product.getAverageRating());
            productDTO.setReviewCount(product.getReviewCount());
            productDTO.setCategoryId(product.getCategory().getId());
            productDTO.setCategoryName(product.getCategory().getName());

            itemDTO.setProduct(productDTO);
            return itemDTO;
        }).collect(Collectors.toList()));

        return dto;
    }

    public CartItemDTO convertToCartItemDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setQuantity(item.getQuantity());
        dto.setPrice(item.getPrice());

        Product product = item.getProduct();
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setDescription(product.getDescription());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setPrice(product.getPrice());
        productDTO.setStock(product.getStock());
        productDTO.setAvailable(product.isAvailable());
        productDTO.setBrandId(product.getBrand().getId());
        productDTO.setBrandName(product.getBrand().getName());
        productDTO.setAverageRating(product.getAverageRating());
        productDTO.setReviewCount(product.getReviewCount());
        productDTO.setCategoryId(product.getCategory().getId());
        productDTO.setCategoryName(product.getCategory().getName());

        dto.setProduct(productDTO);
        return dto;
    }

}
