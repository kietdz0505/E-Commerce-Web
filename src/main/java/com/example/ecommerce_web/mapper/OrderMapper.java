package com.example.ecommerce_web.mapper;

import com.example.ecommerce_web.dto.OrderDTO;
import com.example.ecommerce_web.dto.OrderItemResponse;
import com.example.ecommerce_web.model.Order;
import com.example.ecommerce_web.model.OrderItem;

import java.util.List;
import java.util.stream.Collectors;

public class OrderMapper {

    public static OrderDTO toOrderDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setReceiverName(order.getReceiverName());
        dto.setReceiverPhone(order.getReceiverPhone());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setStatus(order.getStatus().name());
        dto.setPaymentMethod(order.getPaymentMethod().name());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setItems(toOrderItemResponseList(order.getItems()));
        return dto;
    }

    private static List<OrderItemResponse> toOrderItemResponseList(List<OrderItem> items) {
        if (items == null) return List.of();
        return items.stream().map(OrderMapper::toOrderItemResponse).collect(Collectors.toList());
    }

    private static OrderItemResponse toOrderItemResponse(OrderItem item) {
        OrderItemResponse dto = new OrderItemResponse();
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setDiscountedUnitPrice(item.getDiscountedUnitPrice());
        return dto;
    }
}
