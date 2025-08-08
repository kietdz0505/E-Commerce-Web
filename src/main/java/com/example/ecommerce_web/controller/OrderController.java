package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.OrderRequest;
import com.example.ecommerce_web.dto.OrderResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.security.CustomUserDetails;
import com.example.ecommerce_web.service.OrderService;
import com.example.ecommerce_web.service.VNPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final VNPaymentService paymentService;

    @PostMapping
    public ResponseEntity<OrderResponse> placeOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getUserId();

        OrderResponse response = orderService.placeOrder(orderRequest, userId);
        return ResponseEntity.ok(response);
    }


    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getUserId();

        OrderResponse response = orderService.getOrderById(id, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<String> updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            orderService.updateOrderStatus(id, orderStatus);
            return ResponseEntity.ok("Order status updated");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }
    }

    @GetMapping("/my")
    public ResponseEntity<Page<OrderResponse>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getUserId();

        Page<OrderResponse> ordersPage = orderService.getUserOrders(userId, page, size,sortDirection);
        return ResponseEntity.ok(ordersPage);
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(
            @PathVariable Long id,
            Authentication authentication
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getUserId();

        try {
            orderService.cancelOrder(id, userId);
            return ResponseEntity.ok("Order has been canceled successfully");
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }



}
