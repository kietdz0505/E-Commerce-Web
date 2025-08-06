package com.example.ecommerce_web.dto;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderResponse {

    private Long id;
    private String receiverName;
    private String receiverPhone;
    private String deliveryAddress;
    private String paymentMethod;
    private String status;
    private LocalDateTime orderDate;

    @JsonSerialize(using = VndBigDecimalSerializer.class)
    private BigDecimal totalAmount;

    private String promotionCode;
    private List<OrderItemResponse> items;

}
