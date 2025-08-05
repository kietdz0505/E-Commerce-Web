package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(name = "payment_transaction")
@Data
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long orderId;

    private String paymentGateway; // VNPay | Momo

    private String txnRef;  // VNPay: vnp_TxnRef | Momo: orderId-123456789

    private String requestPayload;

    private String responsePayload;

    private String resultCode;

    private String message;

    private LocalDateTime createdAt = LocalDateTime.now();
}
