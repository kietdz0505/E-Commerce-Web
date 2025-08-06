package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.service.MomoPaymentService;
import com.example.ecommerce_web.service.OrderService;
import com.example.ecommerce_web.service.VNPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final MomoPaymentService momoPaymentService;
    private final VNPaymentService vnPaymentService;
    private final OrderService orderService;

    @PostMapping("/vnpay")
    public ResponseEntity<?> createVNPayPayment(@RequestParam Long orderId) {
        String orderInfo = "Thanh toán đơn hàng #" + orderId;
        String paymentUrl = vnPaymentService.createVNPayPayment(orderId, orderInfo);
        return ResponseEntity.ok(Collections.singletonMap("paymentUrl", paymentUrl));
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<String> handleVNPayReturn(@RequestParam Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        boolean isValidChecksum = vnPaymentService.verifyVNPayChecksum(params, secureHash);

        if (!isValidChecksum) {
            return ResponseEntity.badRequest().body("Invalid checksum. Possible tampering detected.");
        }

        String responseCode = params.get("vnp_ResponseCode");
        String txnRef = params.get("vnp_TxnRef");
        Long orderId = vnPaymentService.getOrderIdFromTxnRef(txnRef);

        if (orderId == null) {
            return ResponseEntity.badRequest().body("Invalid TxnRef");
        }

        if ("00".equals(responseCode)) {
            orderService.updateOrderStatus(orderId, OrderStatus.PAID);
        } else {
            orderService.updateOrderStatus(orderId, OrderStatus.FAILED);
        }

        vnPaymentService.handleVNPayReturn(params);

        return ResponseEntity.ok("Payment Result Processed Successfully.");
    }


    @PostMapping("/momo")
    public ResponseEntity<?> createMomoPayment(@RequestParam Long orderId) {
        String orderInfo = "Thanh toán đơn hàng #" + orderId;
        MomoPaymentResponse response = momoPaymentService.createPayment(orderId, orderInfo);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/momo-notify")
    public ResponseEntity<?> momoNotify(@RequestBody Map<String, String> payload) {
        momoPaymentService.handleMomoNotification(payload);
        return ResponseEntity.ok("Notify Received");
    }

    @GetMapping("/momo-return")
    public ResponseEntity<?> momoReturn(@RequestParam Map<String, String> params) {
        // Momo Return URL KHÔNG XỬ LÝ ORDER TRẠNG THÁI (IPN sẽ xử lý)
        String message = "Payment " + ("0".equals(params.get("resultCode")) ? "Success" : "Failed") +
                ". Please wait while we confirm your payment.";
        return ResponseEntity.ok(message);
    }
}
