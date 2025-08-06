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
    public OrderResponse placeOrder(OrderRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

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
        order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
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

            product.setStock(product.getStock() - itemReq.getQuantity());

            BigDecimal originalPrice = BigDecimal.valueOf(product.getPrice());
            BigDecimal discountedPrice = originalPrice;


            if (promotion != null && promotion.getProducts().stream()
                    .anyMatch(p -> p.getId().equals(product.getId()))) {
                BigDecimal discount = originalPrice.multiply(promotion.getDiscountPercent())
                        .divide(BigDecimal.valueOf(100));
                discountedPrice = originalPrice.subtract(discount);
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(itemReq.getQuantity());
            orderItem.setUnitPrice(originalPrice);
            orderItem.setDiscountedUnitPrice(discountedPrice);
            orderItems.add(orderItem);

            totalPrice = totalPrice.add(discountedPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        if (promotion != null && promotion.getUsageLimit() != null) {
            promotion.setUsageLimit(promotion.getUsageLimit() - 1);
            promotionRepository.save(promotion);
        }

        order.setItems(orderItems);
        order.setTotalAmount(totalPrice);

        orderRepository.save(order);

        return mapToOrderResponse(order);  // ✅ Trả về DTO Response
    }

    public OrderResponse getOrderById(Long id, String userId) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToOrderResponse(order);
    }

    public Page<OrderResponse> getUserOrders(String userId, int page, int size) {
        PageRequest pageable = PageRequest.of(page, size);
        Page<Order> ordersPage = orderRepository.findByUserId(userId, pageable);

        return ordersPage.map(this::mapToOrderResponse);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == status) {
            System.out.println("Order #" + orderId + " already in status: " + status);
            return;  // Idempotent update
        }

        order.setStatus(status);
        orderRepository.save(order);
    }

    public Long getOrderAmount(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return order.getTotalAmount().longValue();
    }

    public OrderStatus getOrderStatus(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return order.getStatus();
    }

    // ----------------- PRIVATE MAPPER -------------------
    private OrderResponse mapToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setReceiverName(order.getReceiverName());
        response.setReceiverPhone(order.getReceiverPhone());
        response.setDeliveryAddress(order.getDeliveryAddress());
        response.setPaymentMethod(order.getPaymentMethod().name());
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
            itemRes.setDiscountedUnitPrice(item.getDiscountedUnitPrice());
            return itemRes;
        }).toList();

        response.setItems(items);
        return response;
    }
}
