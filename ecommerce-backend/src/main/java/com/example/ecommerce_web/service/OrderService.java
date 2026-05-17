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

    // =========================================================
    // PLACE ORDER
    // =========================================================

    @Transactional
    public OrderResponse placeOrder(OrderRequest request, String userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Promotion promotion = resolvePromotion(request.getPromotionCode());

        Order order = new Order();
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setPaymentMethod(PaymentMethod.valueOf(request.getPaymentMethod().toUpperCase()));
        order.setStatus(OrderStatus.PENDING);
        order.setOrderDate(LocalDateTime.now());
        order.setUser(user);
        order.setPromotion(promotion);




        List<OrderItem> items = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq : request.getItems()) {

            Product product = productRepository.findById(itemReq.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            if (product.getStock() < itemReq.getQuantity()) {
                throw new RuntimeException("Not enough stock for product: " + product.getName());
            }

            product.setStock(product.getStock() - itemReq.getQuantity());
            productRepository.save(product);

            BigDecimal originalPrice   = BigDecimal.valueOf(product.getPrice());
            BigDecimal discountedPrice = applyPromotion(promotion, product, originalPrice);

            OrderItem item = new OrderItem();
            item.setOrder(order);
            item.setProduct(product);
            item.setQuantity(itemReq.getQuantity());
            item.setUnitPrice(originalPrice);
            item.setDiscountedUnitPrice(discountedPrice);
            items.add(item);

            total = total.add(discountedPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())));
        }

        order.setItems(items);
        order.setTotalAmount(total);
        orderRepository.save(order);

        return mapToOrderResponse(order);
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



    // =========================================================
    // GET ORDER
    // =========================================================

    public OrderResponse getOrderById(
            Long id,
            String userId
    ) {

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

    // =========================================================
    // USER ORDERS
    // =========================================================

    public Page<OrderResponse> getUserOrders(
            String userId,
            int page,
            int size,
            String sortDirection
    ) {

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

    // =========================================================
    // CANCEL ORDER
    // =========================================================

    @Transactional
    public OrderResponse cancelOrder(
            Long orderId,
            String userId
    ) {

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

    // =========================================================
    // UPDATE ORDER
    // =========================================================

    @Transactional
    public OrderResponse updateOrder(
            Long orderId,
            String userId,
            OrderRequest request
    ) {

        Order order = orderRepository
                .findByIdAndUserId(orderId, userId)
                .orElseThrow(() ->
                        new RuntimeException("Order not found"));

        /*
         * ================================
         * VALIDATE STATUS
         * ================================
         */

        OrderStatus status = order.getStatus();

        // Không cho sửa nếu đã đi vào fulfillment cuối
        if (
                status == OrderStatus.SHIPPED ||
                        status == OrderStatus.COMPLETED ||
                        status == OrderStatus.CANCELLED
        ) {

            throw new RuntimeException(
                    "Order can no longer be updated"
            );
        }

        /*
         * ================================
         * UPDATE SHIPPING INFO
         * ================================
         */

        order.setReceiverName(
                request.getReceiverName()
        );

        order.setReceiverPhone(
                request.getReceiverPhone()
        );

        order.setDeliveryAddress(
                request.getDeliveryAddress()
        );

        /*
         * ================================
         * PAID ORDER:
         * chỉ cho sửa thông tin nhận hàng
         * ================================
         */

        if (status == OrderStatus.PAID) {

            return mapToOrderResponse(order);
        }

        /*
         * ================================
         * CHỈ PENDING / FAILED
         * ĐƯỢC FULL UPDATE
         * ================================
         */

        // restore stock cũ
        for (OrderItem oldItem : order.getItems()) {

            Product product = oldItem.getProduct();

            product.setStock(
                    product.getStock()
                            + oldItem.getQuantity()
            );
        }

        // xóa item cũ
        order.getItems().clear();

        /*
         * ================================
         * PAYMENT METHOD
         * ================================
         */

        if (
                request.getPaymentMethod() != null &&
                        !request.getPaymentMethod().isBlank()
        ) {

            order.setPaymentMethod(
                    PaymentMethod.valueOf(
                            request.getPaymentMethod()
                                    .toUpperCase()
                    )
            );
        }

        /*
         * ================================
         * PROMOTION
         * ================================
         */

        Promotion promotion = null;

        if (
                request.getPromotionCode() != null &&
                        !request.getPromotionCode().isBlank()
        ) {

            promotion = promotionRepository
                    .findByCode(request.getPromotionCode())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Promotion not found"
                            ));

            if (!promotion.isActive()) {

                throw new RuntimeException(
                        "Promotion is inactive"
                );
            }
        }

        order.setPromotion(promotion);

        /*
         * ================================
         * REBUILD ORDER ITEMS
         * ================================
         */

        BigDecimal total = BigDecimal.ZERO;

        for (OrderItemRequest itemReq :
                request.getItems()) {

            Product product = productRepository
                    .findById(itemReq.getProductId())
                    .orElseThrow(() ->
                            new RuntimeException(
                                    "Product not found"
                            ));

            /*
             * CHECK STOCK
             */

            if (
                    product.getStock()
                            < itemReq.getQuantity()
            ) {

                throw new RuntimeException(
                        "Not enough stock for product: "
                                + product.getName()
                );
            }

            /*
             * REDUCE STOCK
             */

            product.setStock(
                    product.getStock()
                            - itemReq.getQuantity()
            );

            BigDecimal originalPrice =
                    BigDecimal.valueOf(
                            product.getPrice()
                    );

            BigDecimal discountedPrice =
                    originalPrice;

            /*
             * APPLY PROMOTION
             */

            if (
                    promotion != null &&
                            promotion.getProducts()
                                    .stream()
                                    .anyMatch(p ->
                                            p.getId()
                                                    .equals(product.getId()))
            ) {

                BigDecimal discount =
                        originalPrice.multiply(
                                promotion.getDiscountPercent()
                                        .divide(
                                                BigDecimal.valueOf(100)
                                        )
                        );

                discountedPrice =
                        originalPrice.subtract(discount);
            }

            /*
             * CREATE ORDER ITEM
             */

            OrderItem orderItem =
                    new OrderItem();

            orderItem.setOrder(order);
            orderItem.setProduct(product);
            orderItem.setQuantity(
                    itemReq.getQuantity()
            );

            orderItem.setUnitPrice(
                    originalPrice
            );

            orderItem.setDiscountedUnitPrice(
                    discountedPrice
            );

            order.getItems().add(orderItem);

            /*
             * CALCULATE TOTAL
             */

            total = total.add(
                    discountedPrice.multiply(
                            BigDecimal.valueOf(
                                    itemReq.getQuantity()
                            )
                    )
            );
        }

        /*
         * ================================
         * UPDATE TOTAL
         * ================================
         */

        order.setTotalAmount(total);

        /*
         * ================================
         * SAVE
         * ================================
         */

        Order savedOrder =
                orderRepository.save(order);

        return mapToOrderResponse(savedOrder);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    @Transactional
    public void updateOrderStatus(
            Long orderId,
            OrderStatus newStatus
    ) {

        Order order = getOrderEntity(orderId);

        OrderStatus oldStatus =
                order.getStatus();

        // IDEMPOTENT
        if (oldStatus == newStatus) {
            return;
        }

        // VALIDATION
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

        order.setStatus(newStatus);

        orderRepository.save(order);

        // CLEAR CART AFTER PAID
        if (oldStatus != OrderStatus.PAID
                && newStatus == OrderStatus.PAID) {

            cartService.clearCart(
                    order.getUser().getId()
            );
        }

        // RESTORE STOCK ON CANCEL
        if (oldStatus != OrderStatus.CANCELLED
                && newStatus == OrderStatus.CANCELLED) {

            restoreStock(order);
        }

        // RESTORE STOCK ON FAILED
        if (oldStatus != OrderStatus.FAILED
                && newStatus == OrderStatus.FAILED) {

            restoreStock(order);
        }
    }

    // =========================================================
    // ADMIN
    // =========================================================

    public Page<OrderResponse> getAllOrders(
            int page,
            int size,
            String sortDirection
    ) {

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

    public OrderResponse getOrderByIdForAdmin(
            Long id
    ) {

        return mapToOrderResponse(
                getOrderEntity(id)
        );
    }

    @Transactional
    public void updateOrderStatusByAdmin(
            Long orderId,
            OrderStatus status
    ) {

        updateOrderStatus(orderId, status);
    }

    @Transactional
    public void deleteOrderByAdmin(Long orderId) {

        if (!orderRepository.existsById(orderId)) {
            throw new RuntimeException("Order not found");
        }

        orderRepository.deleteById(orderId);
    }

    // =========================================================
    // HELPERS
    // =========================================================

    private void restoreStock(Order order) {

        order.getItems().forEach(item -> {

            Product product =
                    item.getProduct();

            product.setStock(
                    product.getStock()
                            + item.getQuantity()
            );

            productRepository.save(product);
        });
    }

    private boolean isCancelableByUser(
            OrderStatus status,
            long hoursSinceOrder
    ) {

        return (
                status == OrderStatus.PENDING
                        || status == OrderStatus.PAID
        ) && hoursSinceOrder <= cancelLimitHours;
    }

    private boolean isValidTransition(
            OrderStatus oldStatus,
            OrderStatus newStatus
    ) {

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

    private OrderResponse mapToOrderResponse(
            Order order
    ) {

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