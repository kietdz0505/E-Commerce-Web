package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.OrderItemResponse;
import com.example.ecommerce_web.dto.OrderRequest;
import com.example.ecommerce_web.dto.OrderItemRequest;
import com.example.ecommerce_web.dto.OrderResponse;
import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
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
    @Value("${order.cancel.limit-hours}")
    private int cancelLimitHours;

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

    public Page<OrderResponse> getUserOrders(String userId, int page, int size, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, "orderDate"));
        Page<Order> ordersPage = orderRepository.findByUser_Id(userId, pageable);
        return ordersPage.map(this::mapToOrderResponse);
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

    public OrderResponse cancelOrder(Long orderId, String userId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        System.out.println("Order date: " + order.getOrderDate());
        System.out.println("Now: " + LocalDateTime.now());
        System.out.println("Order status: " + order.getStatus());
        System.out.println("Order userId: " + order.getUser().getId());
        System.out.println("Request userId: " + userId);

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        long hoursSinceOrder = Duration.between(order.getOrderDate(), LocalDateTime.now()).toHours();
        System.out.println("Hours since order: " + hoursSinceOrder);

        if (!isCancelableByUser(order.getStatus(), hoursSinceOrder)) {
            throw new RuntimeException("You cannot cancel this order");
        }

        order.setStatus(OrderStatus.CANCELLED);
        restoreStock(order);
        return mapToOrderResponse(orderRepository.save(order));
    }


    private boolean isCancelableByUser(OrderStatus status, long hoursSinceOrder) {
        return (status == OrderStatus.PENDING || status == OrderStatus.PAID)
                && hoursSinceOrder <= cancelLimitHours;
    }

    private void restoreStock(Order order) {
        order.getItems().forEach(item -> {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        });
    }

    public OrderResponse updateOrderDetailIfPending(Long orderId, String userId, OrderRequest orderRequest) {
        Order order = orderRepository.findByIdAndUserId(orderId, userId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Chỉ cho phép update nếu trạng thái là PENDING
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new IllegalArgumentException("Cannot update order. Status is not PENDING");
        }

        // Cập nhật thông tin người nhận
        order.setReceiverName(orderRequest.getReceiverName());
        order.setReceiverPhone(orderRequest.getReceiverPhone());
        order.setDeliveryAddress(orderRequest.getDeliveryAddress());
        if (orderRequest.getPaymentMethod() != null) {
            order.setPaymentMethod(PaymentMethod.valueOf(orderRequest.getPaymentMethod().toUpperCase()));
        }

        // Reset lại items
        order.getItems().clear();
        BigDecimal totalPrice = BigDecimal.ZERO;

        // Nếu có items mới thì thêm vào
        if (orderRequest.getItems() != null && !orderRequest.getItems().isEmpty()) {
            for (OrderItemRequest itemReq : orderRequest.getItems()) {
                Product product = productRepository.findById(itemReq.getProductId())
                        .orElseThrow(() -> new IllegalArgumentException("Product not found"));

                // Kiểm tra tồn kho
                if (product.getStock() < itemReq.getQuantity()) {
                    throw new IllegalArgumentException("Not enough stock for product: " + product.getName());
                }

                BigDecimal originalPrice = BigDecimal.valueOf(product.getPrice());
                BigDecimal discountedPrice = originalPrice;

                // Nếu có promotion và áp dụng cho sản phẩm này
                if (orderRequest.getPromotionCode() != null) {
                    Promotion promotion = promotionRepository.findByCode(orderRequest.getPromotionCode())
                            .orElseThrow(() -> new IllegalArgumentException("Promotion not found with code: " + orderRequest.getPromotionCode()));

                    if (promotion.isActive() &&
                            promotion.getProducts().stream().anyMatch(p -> p.getId().equals(product.getId()))) {
                        BigDecimal discount = originalPrice.multiply(promotion.getDiscountPercent())
                                .divide(BigDecimal.valueOf(100));
                        discountedPrice = originalPrice.subtract(discount);
                        order.setPromotion(promotion);
                    }
                }

                // Tạo OrderItem mới
                OrderItem orderItem = new OrderItem();
                orderItem.setOrder(order);
                orderItem.setProduct(product);
                orderItem.setQuantity(itemReq.getQuantity());
                orderItem.setUnitPrice(originalPrice);
                orderItem.setDiscountedUnitPrice(discountedPrice);

                order.getItems().add(orderItem);

                // Cộng dồn vào total
                totalPrice = totalPrice.add(discountedPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
            }
        }

        // Nếu không truyền promotionCode thì xóa khuyến mãi cũ
        if (orderRequest.getPromotionCode() == null) {
            order.setPromotion(null);
        }

        // Cập nhật tổng tiền
        order.setTotalAmount(totalPrice);

        orderRepository.save(order);
        return mapToOrderResponse(order);
    }

    public String getOrderPaymentMethod(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
        return order.getPaymentMethod().name(); // trả về "MOMO", "VNPAY", "COD"
    }


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
        response.setCancelLimitHours(cancelLimitHours);

        if (order.getPromotion() != null) {
            response.setPromotionCode(order.getPromotion().getCode());
        }

        boolean cancelable =
                (order.getStatus() == OrderStatus.PENDING || order.getStatus() == OrderStatus.PAID) &&
                        LocalDateTime.now().isBefore(order.getOrderDate().plusHours(cancelLimitHours));
        response.setCancelable(cancelable);  // <-- Thêm dòng này

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


    public Page<OrderResponse> getAllOrders(int page, int size, String sortDirection) {
        Sort.Direction direction = sortDirection.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        PageRequest pageable = PageRequest.of(page, size, Sort.by(direction, "orderDate"));
        Page<Order> ordersPage = orderRepository.findAll(pageable);
        return ordersPage.map(this::mapToOrderResponse);
    }

    public void updateOrderStatus(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() == status) {
            mapToOrderResponse(order);
            return; // không đổi, trả lại dữ liệu cũ
        }

        // Nếu user hủy đơn => cộng lại tồn kho
        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            order.getItems().forEach(item -> {
                Product product = item.getProduct();
                product.setStock(product.getStock() + item.getQuantity());
                productRepository.save(product);
            });
        }

        order.setStatus(status);
        Order updated = orderRepository.save(order);
        mapToOrderResponse(updated);
    }

    public OrderResponse getOrderByIdForAdmin(Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        return mapToOrderResponse(order);
    }

    private boolean isValidStatusTransition(OrderStatus currentStatus, OrderStatus newStatus) {
        return switch (currentStatus) {
            case PENDING -> newStatus == OrderStatus.PAID ||
                    newStatus == OrderStatus.SHIPPED ||
                    newStatus == OrderStatus.CANCELLED;
            case SHIPPED -> newStatus == OrderStatus.COMPLETED ||
                    newStatus == OrderStatus.FAILED;
            case PAID -> newStatus == OrderStatus.SHIPPED ||
                    newStatus == OrderStatus.CANCELLED;
            default -> false;
        };
    }

    public void updateOrderStatusByAdmin(Long orderId, OrderStatus status) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!isValidStatusTransition(order.getStatus(), status)) {
            throw new RuntimeException(
                    "Invalid status transition: " + order.getStatus() + " → " + status
            );
        }

        if (status == OrderStatus.CANCELLED && order.getStatus() != OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        order.setStatus(status);
        orderRepository.save(order);
    }

    public void deleteOrderByAdmin(Long orderId) {
        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }
        orderRepository.deleteById(orderId);
    }


}
