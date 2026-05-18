package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.OrderItemRequest;
import com.example.ecommerce_web.dto.OrderItemResponse;
import com.example.ecommerce_web.dto.OrderRequest;
import com.example.ecommerce_web.dto.OrderResponse;
import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.OrderRepository;
import com.example.ecommerce_web.repository.ProductRepository;
import com.example.ecommerce_web.repository.PromotionRepository;
import com.example.ecommerce_web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.extern.slf4j.Slf4j;
@Slf4j
@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final CartService cartService;

    @Value("${order.cancel.limit-hours}")
    private int cancelLimitHours;

    @Transactional
    public OrderResponse placeOrder(OrderRequest request, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));
        Promotion promotion =
                resolvePromotion(
                        request.getPromotionCode()
                );
        Order order = new Order();
        order.setReceiverName(
                request.getReceiverName()
        );
        order.setReceiverPhone(
                request.getReceiverPhone()
        );
        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );
        order.setPaymentMethod(
                PaymentMethod.valueOf(
                        request.getPaymentMethod()
                                .toUpperCase()
                )
        );

        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(
                LocalDateTime.now()
        );
        order.setUser(user);
        order.setPromotion(promotion);

        List<OrderItem> items =
                new ArrayList<>();

        BigDecimal total =
                BigDecimal.ZERO;

        for (OrderItemRequest itemReq :
                request.getItems()) {

            Product product =
                    productRepository.findById(
                            itemReq.getProductId()
                    ).orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found"
                            )
                    );

            int currentStock =
                    product.getStock();

            int buyQuantity =
                    itemReq.getQuantity();

            if (currentStock < buyQuantity) {

                throw new RuntimeException(
                        "Sản phẩm đã hết hàng: "
                                + product.getName()
                );
            }
            product.setStock(
                    currentStock - buyQuantity
            );

            try {
                productRepository.saveAndFlush(product);

            } catch (
                    ObjectOptimisticLockingFailureException e
            ) {

                throw new RuntimeException(
                        "Sản phẩm vừa được mua bởi người khác: "
                                + product.getName()
                );
            }

            BigDecimal originalPrice =
                    BigDecimal.valueOf(
                            product.getPrice()
                    );

            BigDecimal discountedPrice =
                    applyPromotion(
                            promotion,
                            product,
                            originalPrice
                    );
            OrderItem item =
                    new OrderItem();

            item.setOrder(order);

            item.setProduct(product);

            item.setQuantity(
                    buyQuantity
            );

            item.setUnitPrice(
                    originalPrice
            );

            item.setDiscountedUnitPrice(
                    discountedPrice
            );

            items.add(item);
            total = total.add(
                    discountedPrice.multiply(
                            BigDecimal.valueOf(
                                    buyQuantity
                            )
                    )
            );
        }
        order.setItems(items);

        order.setTotalAmount(total);

        Order savedOrder =
                orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
    }

    private Promotion resolvePromotion(String promotionCode) {
        if (promotionCode == null || promotionCode.isBlank()) return null;
        return promotionRepository.findByCode(promotionCode)
                .orElseThrow(() -> new RuntimeException("Promotion not found"));
    }

    private BigDecimal applyPromotion(Promotion promotion, Product product, BigDecimal originalPrice) {
        if (promotion == null
                || !promotion.isActive()
                || !promotion.appliesToProduct(product.getId())) {
            return originalPrice;
        }
        BigDecimal discount = originalPrice.multiply(
                promotion.getDiscountPercent().divide(BigDecimal.valueOf(100))
        );
        return originalPrice.subtract(discount);
    }

    public OrderResponse getOrderById(Long id, String userId) {

        Order order = orderRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        return mapToOrderResponse(order);
    }

    public Order getOrderEntity(Long orderId) {

        return orderRepository.findById(orderId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));
    }

    public String getOrderPaymentMethod(Long orderId) {
        return getOrderEntity(orderId)
                .getPaymentMethod()
                .name();
    }

    public Long getOrderAmount(Long orderId) {

        return getOrderEntity(orderId)
                .getTotalAmount()
                .longValue();
    }

    public OrderStatus getOrderStatus(Long orderId) {

        return getOrderEntity(orderId)
                .getStatus();
    }

    public Page<OrderResponse> getUserOrders(String userId, int page, int size, String sortDirection) {

        Sort.Direction direction =
                sortDirection.equalsIgnoreCase("asc")
                        ? Sort.Direction.ASC
                        : Sort.Direction.DESC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(direction, "orderDate")
                );

        return orderRepository.findByUser_Id(
                        userId,
                        pageable
                )
                .map(this::mapToOrderResponse);
    }

    @Transactional
    public OrderResponse cancelOrder(Long orderId, String userId) {

        Order order = getOrderEntity(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }

        long hoursSinceOrder =
                Duration.between(
                        order.getOrderDate(),
                        LocalDateTime.now()
                ).toHours();

        if (!isCancelableByUser(
                order.getStatus(),
                hoursSinceOrder
        )) {

            throw new RuntimeException(
                    "You cannot cancel this order"
            );
        }

        updateOrderStatus(
                orderId,
                OrderStatus.CANCELLED
        );

        return mapToOrderResponse(
                getOrderEntity(orderId)
        );
    }

    @Transactional
    public OrderResponse updateOrder(Long orderId, String userId, OrderRequest request) {

        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));


        OrderStatus status =
                order.getStatus();

        // Không cho sửa nếu đã hoàn tất flow
        if (
                status == OrderStatus.SHIPPED
                        || status == OrderStatus.COMPLETED
                        || status == OrderStatus.CANCELLED
        ) {

            throw new RuntimeException(
                    "Order can no longer be updated"
            );
        }

        // =====================================================
        // UPDATE SHIPPING INFO
        // =====================================================

        order.setReceiverName(
                request.getReceiverName()
        );

        order.setReceiverPhone(
                request.getReceiverPhone()
        );

        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        // =====================================================
        // PAID:
        // chỉ cho sửa thông tin giao hàng
        // =====================================================

        if (status == OrderStatus.PAID) {

            Order savedOrder =
                    orderRepository.save(order);

            return mapToOrderResponse(savedOrder);
        }

        // =====================================================
        // RESTORE OLD STOCK
        // =====================================================

        for (OrderItem oldItem :
                order.getItems()) {

            Product product =
                    productRepository.findById(
                            oldItem.getProduct().getId()
                    ).orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found"
                            )
                    );

            product.setStock(
                    product.getStock()
                            + oldItem.getQuantity()
            );

            try {

                productRepository.saveAndFlush(product);

            } catch (
                    ObjectOptimisticLockingFailureException e
            ) {

                throw new RuntimeException(
                        "Sản phẩm vừa được cập nhật: "
                                + product.getName()
                );
            }
        }

        // =====================================================
        // CLEAR OLD ITEMS
        // =====================================================

        order.getItems().clear();

        // =====================================================
        // PAYMENT METHOD
        // =====================================================

        if (
                request.getPaymentMethod() != null
                        && !request.getPaymentMethod().isBlank()
        ) {

            order.setPaymentMethod(
                    PaymentMethod.valueOf(
                            request.getPaymentMethod()
                                    .toUpperCase()
                    )
            );
        }

        // =====================================================
        // PROMOTION
        // =====================================================

        Promotion promotion = null;

        if (
                request.getPromotionCode() != null
                        && !request.getPromotionCode().isBlank()
        ) {

            promotion = promotionRepository
                    .findByCode(
                            request.getPromotionCode()
                    ).orElseThrow(
                            () -> new RuntimeException(
                                    "Promotion not found"
                            )
                    );

            if (!promotion.isActive()) {

                throw new RuntimeException(
                        "Promotion is inactive"
                );
            }
        }

        order.setPromotion(promotion);

        // =====================================================
        // REBUILD ITEMS
        // =====================================================

        BigDecimal total =
                BigDecimal.ZERO;

        List<OrderItem> newItems =
                new ArrayList<>();

        for (OrderItemRequest itemReq :
                request.getItems()) {

            Product product =
                    productRepository.findById(
                            itemReq.getProductId()
                    ).orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found"
                            )
                    );

            int currentStock =
                    product.getStock();

            int buyQuantity =
                    itemReq.getQuantity();

            // =================================================
            // CHECK STOCK
            // =================================================

            if (currentStock < buyQuantity) {

                throw new RuntimeException(
                        "Sản phẩm đã hết hàng: "
                                + product.getName()
                );
            }

            // =================================================
            // RESERVE STOCK AGAIN
            // =================================================

            product.setStock(
                    currentStock - buyQuantity
            );

            try {

                productRepository.saveAndFlush(product);

            } catch (
                    ObjectOptimisticLockingFailureException e
            ) {

                throw new RuntimeException(
                        "Sản phẩm vừa được mua bởi người khác: "
                                + product.getName()
                );
            }

            // =================================================
            // PRICE
            // =================================================

            BigDecimal originalPrice =
                    BigDecimal.valueOf(
                            product.getPrice()
                    );

            BigDecimal discountedPrice =
                    applyPromotion(
                            promotion,
                            product,
                            originalPrice
                    );

            // =================================================
            // CREATE ITEM
            // =================================================

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);

            orderItem.setProduct(product);

            orderItem.setQuantity(
                    buyQuantity
            );

            orderItem.setUnitPrice(
                    originalPrice
            );

            orderItem.setDiscountedUnitPrice(
                    discountedPrice
            );

            newItems.add(orderItem);

            // =================================================
            // TOTAL
            // =================================================

            total = total.add(
                    discountedPrice.multiply(
                            BigDecimal.valueOf(
                                    buyQuantity
                            )
                    )
            );
        }

        // =====================================================
        // SAVE ORDER
        // =====================================================

        order.setItems(newItems);

        order.setTotalAmount(total);

        Order savedOrder =
                orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
    }

    @Transactional
    public void updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = getOrderEntity(orderId);

        OrderStatus oldStatus =
                order.getStatus();

        // =====================================================
        // IDEMPOTENT
        // tránh callback payment gọi nhiều lần
        // =====================================================

        if (oldStatus == newStatus) {
            return;
        }

        // =====================================================
        // VALIDATE STATUS FLOW
        // =====================================================

        if (!isValidTransition(
                oldStatus,
                newStatus
        )) {

            throw new RuntimeException(
                    "Invalid status transition: "
                            + oldStatus
                            + " -> "
                            + newStatus
            );
        }

        try {

            // =================================================
            // PAYMENT SUCCESS
            // =================================================
            // Stock đã reserve từ lúc tạo order
            // nên ở đây KHÔNG trừ stock nữa
            // =================================================

            if (newStatus == OrderStatus.PAID) {

                // clear cart sau khi thanh toán thành công
                cartService.clearCart(
                        order.getUser().getId()
                );
            }

            // =================================================
            // PAYMENT FAILED / CANCELLED
            // =================================================
            // Trả stock lại
            // Chỉ restore nếu trước đó chưa restore
            // =================================================

            if (
                    (
                            newStatus == OrderStatus.FAILED
                                    || newStatus == OrderStatus.CANCELLED
                    )

                            &&

                            oldStatus != OrderStatus.FAILED
                            &&

                            oldStatus != OrderStatus.CANCELLED
            ) {

                restoreStock(order);
            }

            // =================================================
            // UPDATE STATUS
            // =================================================

            order.setStatus(newStatus);

            orderRepository.save(order);

        } catch (
                ObjectOptimisticLockingFailureException e
        ) {

            throw new RuntimeException(
                    "Có sản phẩm vừa được cập nhật bởi giao dịch khác."
            );
        }
    }

    public Page<OrderResponse> getAllOrders(int page, int size, String sortDirection) {

        Sort.Direction direction =
                sortDirection.equalsIgnoreCase("desc")
                        ? Sort.Direction.DESC
                        : Sort.Direction.ASC;

        Pageable pageable =
                PageRequest.of(
                        page,
                        size,
                        Sort.by(direction, "orderDate")
                );

        return orderRepository.findAll(pageable)
                .map(this::mapToOrderResponse);
    }

    public OrderResponse getOrderByIdForAdmin(Long id) {

        return mapToOrderResponse(
                getOrderEntity(id)
        );
    }

    @Transactional
    public void updateOrderStatusByAdmin(Long orderId, OrderStatus status) {

        updateOrderStatus(orderId, status);
    }

    @Transactional
    public void deleteOrderByAdmin(Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }

        orderRepository.deleteById(orderId);
    }

    private void restoreStock(Order order) {

        for (OrderItem item : order.getItems()) {

            Product product =
                    productRepository.findById(
                            item.getProduct().getId()
                    ).orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found"
                            )
                    );

            product.setStock(
                    product.getStock()
                            + item.getQuantity()
            );

            productRepository.save(product);
        }
    }

    private boolean isCancelableByUser(OrderStatus status, long hoursSinceOrder) {

        return (
                status == OrderStatus.PENDING
                        || status == OrderStatus.PAID
        ) && hoursSinceOrder <= cancelLimitHours;
    }

    private boolean isValidTransition(OrderStatus oldStatus, OrderStatus newStatus) {

        return switch (oldStatus) {

            case PENDING ->
                    newStatus == OrderStatus.PAID
                            || newStatus == OrderStatus.CANCELLED
                            || newStatus == OrderStatus.FAILED;

            case PAID ->
                    newStatus == OrderStatus.SHIPPED
                            || newStatus == OrderStatus.CANCELLED;

            case SHIPPED ->
                    newStatus == OrderStatus.COMPLETED;

            default -> false;
        };
    }

    private void reduceStock(Order order) {

        for (OrderItem item : order.getItems()) {

            Product product =
                    productRepository.findById(
                            item.getProduct().getId()
                    ).orElseThrow(
                            () -> new RuntimeException(
                                    "Product not found"
                            )
                    );

            int currentStock =
                    product.getStock();

            int buyQuantity =
                    item.getQuantity();

            // =====================================
            // CHECK AGAIN
            // =====================================
            if (currentStock < buyQuantity) {

                throw new RuntimeException(
                        "Sản phẩm đã hết hàng: "
                                + product.getName()
                );
            }

            product.setStock(
                    currentStock - buyQuantity
            );

            productRepository.save(product);
        }
    }

    private OrderResponse mapToOrderResponse(Order order) {

        OrderResponse response =
                new OrderResponse();

        response.setId(order.getId());

        response.setReceiverName(
                order.getReceiverName()
        );

        response.setReceiverPhone(
                order.getReceiverPhone()
        );

        response.setDeliveryAddress(
                order.getDeliveryAddress()
        );

        response.setPaymentMethod(
                order.getPaymentMethod().name()
        );

        response.setStatus(
                order.getStatus().name()
        );

        response.setOrderDate(
                order.getOrderDate()
        );

        response.setTotalAmount(
                order.getTotalAmount()
        );

        response.setCancelLimitHours(
                cancelLimitHours
        );

        if (order.getPromotion() != null) {

            response.setPromotionCode(
                    order.getPromotion().getCode()
            );
        }

        boolean cancelable =
                (
                        order.getStatus() == OrderStatus.PENDING
                                || order.getStatus() == OrderStatus.PAID
                )
                        && LocalDateTime.now().isBefore(
                        order.getOrderDate()
                                .plusHours(cancelLimitHours)
                );

        response.setCancelable(cancelable);

        List<OrderItemResponse> items =
                order.getItems()
                        .stream()
                        .map(item -> {

                            OrderItemResponse res =
                                    new OrderItemResponse();

                            res.setProductId(
                                    item.getProduct().getId()
                            );

                            res.setProductName(
                                    item.getProduct().getName()
                            );

                            res.setQuantity(
                                    item.getQuantity()
                            );

                            res.setUnitPrice(
                                    item.getUnitPrice()
                            );

                            res.setDiscountedUnitPrice(
                                    item.getDiscountedUnitPrice()
                            );

                            return res;
                        })
                        .toList();

        response.setItems(items);

        return response;
    }
}