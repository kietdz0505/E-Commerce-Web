package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.OrderItemResponse;
import com.example.ecommerce_web.dto.OrderRequest;
import com.example.ecommerce_web.dto.OrderItemRequest;
import com.example.ecommerce_web.dto.OrderResponse;
import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;

    @Transactional
    public Order placeOrder(OrderRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Tìm Promotion theo code (nếu có)
        Promotion promotion = null;
        if (request.getPromotionCode() != null && !request.getPromotionCode().isEmpty()) {
            promotion = promotionRepository.findByCode(request.getPromotionCode())
                    .orElseThrow(() -> new RuntimeException("Promotion not found"));
            if (!promotion.isActive()) {
                throw new RuntimeException("Promotion code is not active");
            }
            if (promotion.getUsageLimit() != null && promotion.getUsageLimit() <= 0) {
                throw new RuntimeException("Promotion usage limit reached");
            }
        }

        Order order = new Order();
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPaymentMethod(request.getPaymentMethod());
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setUser(user);
        order.setPromotion(promotion);

        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {
            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            // Trừ tồn kho
            product.setStock(product.getStock() - itemReq.getQuantity());

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(product.getPrice());

            orderItems.add(orderItem);

            totalPrice = totalPrice.add(BigDecimal.valueOf(product.getPrice())
                    .multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        // Áp dụng khuyến mãi nếu có
        if (promotion != null) {
            BigDecimal discount = totalPrice.multiply(promotion.getDiscountPercent())
                    .divide(BigDecimal.valueOf(100));
            totalPrice = totalPrice.subtract(discount);

            // Giảm số lần sử dụng (usageLimit - 1)
            if (promotion.getUsageLimit() != null) {
                promotion.setUsageLimit(promotion.getUsageLimit() - 1);
                promotionRepository.save(promotion);
            }
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalPrice); // ✅ Đặt sau khi tính xong totalPrice

        return orderRepository.save(order);
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Order getOrderById(Long id, String userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return order;
    }

    // Lấy danh sách đơn hàng của user (pagination)
    public Page<OrderResponse> getUserOrders(String userId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Order> ordersPage = orderRepository.findByUserId(userId, pageable);

        return ordersPage.map(order -> {
            OrderResponse response = new OrderResponse();
            response.setId(order.getId());
            response.setReceiverName(order.getReceiverName());
            response.setReceiverPhone(order.getReceiverPhone());
            response.setDeliveryAddress(order.getDeliveryAddress());
            response.setPaymentMethod(order.getPaymentMethod());
            response.setStatus(order.getStatus().name());
            response.setOrderDate(order.getOrderDate());
            response.setTotalAmount(order.getTotalAmount());

            if (order.getPromotion() != null) {
                response.setPromotionCode(order.getPromotion().getCode());
            }

            List<OrderItemResponse> items = order.getItems().stream().map(item -> {
                OrderItemResponse itemRes = new OrderItemResponse();
                itemRes.setProductId(item.getProduct().getId());
                itemRes.setProductName(item.getProduct().getName());
                itemRes.setQuantity(item.getQuantity());
                itemRes.setUnitPrice(item.getUnitPrice());
                return itemRes;
            }).toList();

            response.setItems(items);
            return response;
        });
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == status) {
            System.out.println("Order #" + orderId + " already in status: " + status);
            return;  // Idempotent update, không update lại
        }

        order.setStatus(status);
        orderRepository.save(order);
    }


    public Long getOrderAmount(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return order.getTotalAmount().longValue();  // Trả về kiểu Long để dùng cho Payment
    }

    public OrderStatus getOrderStatus(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return order.getStatus();
    }


}
