package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.OrderResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/orders")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOrderController {

    private final OrderService orderService;

    // Lấy tất cả đơn hàng (có phân trang)
    @GetMapping
    public ResponseEntity<Page<OrderResponse>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "desc") String sortDirection
    ) {
        return ResponseEntity.ok(orderService.getAllOrders(page, size, sortDirection));
    }

    // Xem chi tiết 1 đơn hàng
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderByIdForAdmin(id));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam String status
    ) {
        OrderStatus orderStatus;
        try {
            orderStatus = OrderStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body("Trạng thái đơn hàng không hợp lệ: " + status);
        }

        orderService.updateOrderStatusByAdmin(id, orderStatus);
        return ResponseEntity.ok().build();
    }


    // AdminOrderController.java
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrderByAdmin(@PathVariable Long id) {
        orderService.deleteOrderByAdmin(id);
        return ResponseEntity.noContent().build();
    }

}
