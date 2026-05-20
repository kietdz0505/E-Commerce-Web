package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "payment_transaction",
        indexes = {
                @Index(name = "idx_txn_ref", columnList = "txnRef"),
                @Index(name = "idx_order_id", columnList = "orderId")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // order liên kết
    @Column(nullable = false)
    private Long orderId;

    // VNPay / MoMo / ZaloPay
    @Column(nullable = false, length = 50)
    private String paymentGateway;

    // mã giao dịch gateway
    @Column(unique = true, length = 100)
    private String txnRef;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String requestPayload;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String responsePayload;

    // mã kết quả từ gateway (0, 200, etc)
    @Column(length = 20)
    private String resultCode;

    // message mô tả
    @Column(length = 500)
    private String message;

    /*
     * trạng thái nội bộ hệ thống
     */
    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private PaymentStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}