package com.example.ecommerce_web.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class OrderRequest {
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private String paymentMethod;
    private String promotionCode; // Thay vì truyền ID, ta dùng Code
    private List<OrderItemRequest> items;
}

