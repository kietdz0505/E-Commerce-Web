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

    /**
     * Số giờ tối đa cho phép hủy đơn hàng (lấy từ cấu hình server).
     */
    private int cancelLimitHours;

    /**
     * Cho biết đơn hàng có thể hủy hay không (dựa vào cấu hình thời gian cho phép hủy và trạng thái đơn).
     */
    private boolean cancelable;

    @JsonSerialize(using = VndBigDecimalSerializer.class)
    private BigDecimal totalAmount;

    private String promotionCode;
    private List<OrderItemResponse> items;
}
