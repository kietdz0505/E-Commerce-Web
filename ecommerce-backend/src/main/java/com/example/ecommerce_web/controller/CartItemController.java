package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.model.CartItem;
import com.example.ecommerce_web.service.CartItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart-items")
@RequiredArgsConstructor
public class CartItemController {
    private final CartItemService cartItemService;

    @GetMapping
    public List<CartItem> getAll() {
        return cartItemService.getAll();
    }

    @PostMapping
    public CartItem create(@RequestBody CartItem item) {
        return cartItemService.save(item);
    }
}