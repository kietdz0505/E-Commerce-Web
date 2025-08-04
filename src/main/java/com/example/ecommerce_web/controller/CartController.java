package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.CartItemDTO;
import com.example.ecommerce_web.dto.CartResponseDTO;
import com.example.ecommerce_web.model.Cart;
import com.example.ecommerce_web.model.CartItem;
import com.example.ecommerce_web.security.CustomUserDetails;
import com.example.ecommerce_web.service.CartService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    // Lấy giỏ hàng của user hiện tại (bao gồm các item)
    @GetMapping
    public ResponseEntity<CartResponseDTO> getCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Cart cart = cartService.getCartForUser(currentUser.getId());
        return ResponseEntity.ok(cartService.convertToCartResponseDTO(cart));
    }

    @GetMapping("/items")
    public ResponseEntity<List<CartItemDTO>> getCartItems(@AuthenticationPrincipal CustomUserDetails currentUser) {
        List<CartItemDTO> items = cartService.getCartItems(currentUser.getId());
        return ResponseEntity.ok(items);
    }


    // Thêm sản phẩm vào giỏ hàng
    @PostMapping("/add")
    public ResponseEntity<CartItemDTO> addItemToCart(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                     @RequestParam Long productId,
                                                     @RequestParam int quantity) {
        CartItem item = cartService.addItemToCart(currentUser.getId(), productId, quantity);
        return ResponseEntity.ok(cartService.convertToCartItemDTO(item));
    }

    // Cập nhật số lượng item trong giỏ hàng
    @PutMapping("/update/{cartItemId}")
    public ResponseEntity<CartItemDTO> updateCartItem(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                      @PathVariable Long cartItemId,
                                                      @RequestParam int quantity) {
        CartItem updatedItem = cartService.updateCartItemQuantity(currentUser.getId(), cartItemId, quantity);
        return ResponseEntity.ok(cartService.convertToCartItemDTO(updatedItem));
    }

    // Xóa item khỏi giỏ hàng
    @DeleteMapping("/remove/{cartItemId}")
    public ResponseEntity<Void> removeItemFromCart(@AuthenticationPrincipal CustomUserDetails currentUser,
                                                   @PathVariable Long cartItemId) {
        cartService.removeItemFromCart(currentUser.getId(), cartItemId);
        return ResponseEntity.noContent().build();
    }

    // Xóa toàn bộ giỏ hàng
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal CustomUserDetails currentUser) {
        cartService.clearCart(currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    // Tính tổng tiền giỏ hàng
    @GetMapping("/total")
    public ResponseEntity<Double> calculateCartTotal(@AuthenticationPrincipal CustomUserDetails currentUser) {
        Double total = cartService.calculateCartTotal(currentUser.getId());
        return ResponseEntity.ok(total);
    }
}
