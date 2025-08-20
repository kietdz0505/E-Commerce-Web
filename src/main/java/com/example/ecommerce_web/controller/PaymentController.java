package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.dto.PaymentResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.service.MomoPaymentService;
import com.example.ecommerce_web.service.OrderService;
import com.example.ecommerce_web.service.VNPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final MomoPaymentService momoPaymentService;
    private final VNPaymentService vnPaymentService;
    private final OrderService orderService;

    // ===================== MOMO ===================== //

    @PostMapping("/momo")
    public ResponseEntity<PaymentResponse> createMomoPayment(@RequestParam Long orderId, HttpServletRequest request) {
        // Kiểm tra phương thức thanh toán của order
        String paymentMethod = orderService.getOrderPaymentMethod(orderId);
        if (!"MOMO".equalsIgnoreCase(paymentMethod)) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Order is not set to pay with MoMo")
            );
        }

        String orderInfo = "Thanh toán đơn hàng #" + orderId;
        MomoPaymentResponse response = momoPaymentService.createPayment(orderId, orderInfo, request);

        if (response == null || response.getPayUrl() == null) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Failed to generate MoMo payment URL")
            );
        }

        return ResponseEntity.ok(
                PaymentResponse.success("MoMo payment URL generated", response.getPayUrl())
        );
    }

    @PostMapping("/momo-notify")
    public ResponseEntity<String> momoNotify(@RequestBody Map<String, String> payload) {
        momoPaymentService.handleMomoNotification(payload);
        return ResponseEntity.ok("Notify Received");
    }

    @GetMapping("/momo-return")
    public ResponseEntity<PaymentResponse> momoReturn(@RequestParam Map<String, String> params) {
        boolean success = "0".equals(params.get("resultCode"));
        String message = "Payment " + (success ? "Success" : "Failed") +
                ". Please wait while we confirm your payment.";

        return ResponseEntity.ok(
                success ? PaymentResponse.success(message) : PaymentResponse.error(message)
        );
    }

    // ===================== VNPay ===================== //

    @PostMapping("/vnpay")
    public ResponseEntity<PaymentResponse> createVNPayPayment(@RequestParam Long orderId) {
        // Kiểm tra phương thức thanh toán
        String paymentMethod = orderService.getOrderPaymentMethod(orderId);
        if (!"VNPAY".equalsIgnoreCase(paymentMethod)) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Order is not set to pay with VNPay")
            );
        }

        String orderInfo = "Thanh toán đơn hàng #" + orderId;
        String paymentUrl = vnPaymentService.createVNPayPayment(orderId, orderInfo);

        if (paymentUrl == null || paymentUrl.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Failed to generate VNPay payment URL")
            );
        }

        return ResponseEntity.ok(
                PaymentResponse.success("VNPay payment URL generated", paymentUrl)
        );
    }

    @GetMapping("/vnpay-return")
    public ResponseEntity<PaymentResponse> handleVNPayReturn(@RequestParam Map<String, String> params) {
        String secureHash = params.get("vnp_SecureHash");
        boolean isValidChecksum = vnPaymentService.verifyVNPayChecksum(params, secureHash);

        if (!isValidChecksum) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Invalid checksum. Possible tampering detected.")
            );
        }

        // Cập nhật trạng thái order dựa vào params VNPay
        vnPaymentService.handleVNPayReturn(params);

        return ResponseEntity.ok(
                PaymentResponse.success("VNPay payment result processed")
        );
    }
}
