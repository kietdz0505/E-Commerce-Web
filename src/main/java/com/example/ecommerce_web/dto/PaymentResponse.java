package com.example.ecommerce_web.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaymentResponse {
    private boolean success;
    private String message;
    private Object data;

    public static PaymentResponse success(String message) {
        return new PaymentResponse(true, message, null);
    }

    public static PaymentResponse success(String message, Object data) {
        return new PaymentResponse(true, message, data);
    }

    public static PaymentResponse error(String message) {
        return new PaymentResponse(false, message, null);
    }
}
