package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.model.Cart;
import com.example.ecommerce_web.model.CartItem;
import com.example.ecommerce_web.service.CartService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping("/{userId}")
    public Cart getCart(@PathVariable String userId) {
        return cartService.getCartByUserId(userId);
    }

    @PostMapping("/add")
    public CartItem addItem(@RequestParam String userId, @RequestParam Long productId, @RequestParam int quantity) {
        return cartService.addItemToCart(userId, productId, quantity);
    }

    @DeleteMapping("/remove/{cartItemId}")
    public void removeItem(@PathVariable Long cartItemId) {
        cartService.removeItemFromCart(cartItemId);
    }

    @GetMapping("/items/{cartId}")
    public List<CartItem> getCartItems(@PathVariable Long cartId) {
        return cartService.getCartItems(cartId);
    }
}
