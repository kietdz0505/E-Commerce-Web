package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.OrderItemResponse;
import com.example.ecommerce_web.dto.OrderRequest;
import com.example.ecommerce_web.dto.OrderResponse;
import com.example.ecommerce_web.model.Order;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.security.CustomUserDetails;
import com.example.ecommerce_web.service.OrderService;
import com.example.ecommerce_web.service.VNPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final VNPaymentService paymentService;


    @PostMapping
    public ResponseEntity<?> placeOrder(@RequestBody OrderRequest orderRequest, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getUserId();

        Order order = orderService.placeOrder(orderRequest, userId);

        // Map Entity to DTO
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setPaymentMethod(order.getPaymentMethod());
        response.setStatus(order.getStatus().name());
        response.setOrderDate(order.getOrderDate());

        if (order.getPromotion() != null) {
            response.setPromotionCode(order.getPromotion().getCode());
        }

        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            OrderItemResponse itemRes = new OrderItemResponse();
            itemRes.setProductId(item.getProduct().getId());
            itemRes.setProductName(item.getProduct().getName());
            itemRes.setQuantity(item.getQuantity());
            itemRes.setUnitPrice(item.getUnitPrice());
            return itemRes;
        }).toList();

        response.setItems(itemResponses);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/user")
    public ResponseEntity<?> getUserOrders(Principal principal) {
        return ResponseEntity.ok(orderService.getUserOrders(principal.getName()));
    }
//lấy chi tiết đơn hàng
    @GetMapping("/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, Principal principal) {
        Order order = orderService.getOrderById(id, principal.getName());
        return ResponseEntity.ok(order);
    }
//API for Admin
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody String status) {
        try {
            OrderStatus orderStatus = OrderStatus.valueOf(status.trim().toUpperCase());
            orderService.updateOrderStatus(id, orderStatus);
            return ResponseEntity.ok("Order status updated");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid status value");
        }
    }



    @GetMapping("/my")
    public ResponseEntity<?> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String userId = userDetails.getUserId();

        Page<OrderResponse> ordersPage = orderService.getUserOrders(userId, page, size);

        return ResponseEntity.ok(ordersPage);
    }

}
