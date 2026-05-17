package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.dto.PaymentResponse;
import com.example.ecommerce_web.service.MomoPaymentService;
import com.example.ecommerce_web.service.OrderService;
import com.example.ecommerce_web.service.VNPaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final MomoPaymentService momoPaymentService;
    private final VNPaymentService vnPaymentService;
    private final OrderService orderService;

    // ===================== MOMO ===================== //

    @PostMapping("/momo")
    public ResponseEntity<PaymentResponse> createMomoPayment(
            @RequestParam Long orderId,
            HttpServletRequest request
    ) {
        String paymentMethod = orderService.getOrderPaymentMethod(orderId);

        if (!"MOMO".equalsIgnoreCase(paymentMethod)) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Order is not set to pay with MoMo")
            );
        }

        String orderInfo = "Thanh_toan_don_hang_" + orderId;

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
        log.info("===== MOMO NOTIFY ===== {}", payload);
        momoPaymentService.handleMomoNotification(payload);
        return ResponseEntity.ok("Notify Received");
    }

    @GetMapping("/momo-return")
    public ResponseEntity<PaymentResponse> momoReturn(@RequestParam Map<String, String> params) {
        log.info("===== MOMO RETURN ===== {}", params);

        boolean success = "0".equals(params.get("resultCode"));
        String message = "Payment " + (success ? "Success" : "Failed");

        return ResponseEntity.ok(
                success ? PaymentResponse.success(message) : PaymentResponse.error(message)
        );
    }

    // ===================== VNPAY ===================== //

    @PostMapping("/vnpay")
    public ResponseEntity<PaymentResponse> createVNPay(
            @RequestParam Long orderId,
            HttpServletRequest request
    ) {
        String paymentMethod = orderService.getOrderPaymentMethod(orderId);

        if (!"VNPAY".equalsIgnoreCase(paymentMethod)) {
            return ResponseEntity.badRequest().body(
                    PaymentResponse.error("Order is not set to pay with VNPay")
            );
        }

        // FIX 10: Lấy IP đúng cách — hỗ trợ reverse proxy (nginx, load balancer)
        String ipAddr = getClientIp(request);

        String paymentUrl = vnPaymentService.createVNPayPayment(
                orderId,
                "Order " + orderId,   // dùng khoảng trắng, sanitize sẽ xử lý
                ipAddr
        );

        return ResponseEntity.ok(
                PaymentResponse.success("VNPay payment URL generated", paymentUrl)
        );
    }

    /**
     * VNPay gọi endpoint này sau khi user thanh toán xong (redirect về browser).
     *
     * FIX 11: Tách biệt verify và handle — trả lỗi rõ ràng từng bước.
     */
    @GetMapping("/vnpay-return")
    public void returnVNPay(
            @RequestParam Map<String, String> params,
            HttpServletResponse response
    ) throws IOException {

        log.info("===== VNPAY RETURN ===== {}", params);

        String secureHash =
                params.get("vnp_SecureHash");

        if (
                secureHash == null ||
                        secureHash.isBlank()
        ) {

            response.sendRedirect(
                    "http://localhost:5173/my-orders?payment=failed"
            );

            return;
        }

        boolean valid =
                vnPaymentService.verifyVNPayChecksum(
                        params,
                        secureHash
                );

        if (!valid) {

            log.warn(
                    "VNPay invalid checksum — params: {}",
                    params
            );

            response.sendRedirect(
                    "http://localhost:5173/my-orders?payment=failed"
            );

            return;
        }

        vnPaymentService.handleVNPayReturn(params);

        String responseCode =
                params.get("vnp_ResponseCode");

        boolean success =
                "00".equals(responseCode);

        if (success) {

            response.sendRedirect(
                    "http://localhost:5173/my-orders?payment=success"
            );

        } else {

            response.sendRedirect(
                    "http://localhost:5173/my-orders?payment=failed"
            );
        }
    }

    // ================================================================
    // HELPER
    // ================================================================

    /**
     * Lấy IP thực của client, hỗ trợ cả trường hợp qua proxy/nginx.
     */
    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            // X-Forwarded-For có thể chứa nhiều IP: "client, proxy1, proxy2"
            return ip.split(",")[0].trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }
        return request.getRemoteAddr();
    }
}