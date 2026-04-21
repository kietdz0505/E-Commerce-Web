package com.example.ecommerce_web.dto;

import lombok.Data;

@Data
public class MomoPaymentRequest {
    private String partnerCode;
    private String accessKey;
    private String requestId;
    private Long amount;
    private String orderId;
    private String orderInfo;
    private String returnUrl;
    private String notifyUrl;
    private String requestType = "captureWallet";
    private String extraData = "";
    private String signature;
}
