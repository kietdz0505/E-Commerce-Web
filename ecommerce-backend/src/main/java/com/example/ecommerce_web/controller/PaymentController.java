package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.dto.PaymentResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.PaymentStatus;
import com.example.ecommerce_web.model.PaymentMethod;
import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.repository.PaymentTransactionRepository;
import com.example.ecommerce_web.security.CustomUserDetails;
import com.example.ecommerce_web.service.MomoPaymentService;
import com.example.ecommerce_web.service.OrderService;
import com.example.ecommerce_web.service.VNPaymentService;
import com.fasterxml.jackson.core.JsonProcessingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
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
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    // ===================== MOMO ===================== //

    @PostMapping("/momo")
    public ResponseEntity<PaymentResponse> createMomoPayment(
            @RequestParam Long orderId,
            HttpServletRequest request,
            Authentication authentication
    ) {

        orderService.validateOrderForPayment(orderId, getCurrentUserId(authentication), PaymentMethod.MOMO);

        String orderInfo = "Thanh_toan_don_hang_" + orderId;

        MomoPaymentResponse response = momoPaymentService.createPayment(orderId, orderInfo, request);

        if (response == null || response.getPayUrl() == null) {

            return ResponseEntity.badRequest().body(PaymentResponse.error("Failed to generate MoMo payment URL"));
        }

        return ResponseEntity.ok(PaymentResponse.success("MoMo payment URL generated", response.getPayUrl()));
    }

    @PostMapping("/momo-notify")
    public ResponseEntity<String> momoNotify(@RequestBody Map<String, Object> payload) {

        log.info("===== MOMO NOTIFY orderId={}, resultCode={} =====",
                payload.get("orderId"),
                payload.get("resultCode"));

        momoPaymentService.handleMomoNotification(payload);

        return ResponseEntity.ok("Notify Received");
    }

    @GetMapping("/momo-return")
    public void momoReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {

        log.info("===== MOMO RETURN orderId={}, resultCode={} =====",
                params.get("orderId"),
                params.get("resultCode"));

        try {

            boolean success = "0".equals(params.get("resultCode"));

            String momoOrderId = params.get("orderId");

            if (momoOrderId == null || !momoOrderId.contains("-")) {

                response.sendRedirect(frontendUrl + "/my-orders?payment=failed");

                return;
            }

            Long orderId = Long.valueOf(momoOrderId.split("-")[0]);

            if (!momoPaymentService.verifySignature(params)) {

                log.warn("MoMo invalid return signature for order {}", orderId);

                response.sendRedirect(frontendUrl + "/my-orders?payment=failed");

                return;
            }

            if (!momoPaymentService.isValidAmount(orderId, params.get("amount"))) {

                log.warn("MoMo amount mismatch for order {}", orderId);

                response.sendRedirect(frontendUrl + "/my-orders?payment=failed");

                return;
            }

            PaymentTransaction transaction =
                    paymentTransactionRepository.findByTxnRef(momoOrderId)
                            .orElse(null);

            OrderStatus currentStatus = orderService.getOrderStatus(orderId);

            log.info("CURRENT STATUS = {}", currentStatus);

            if (currentStatus != OrderStatus.PAID) {

                if (success) {

                    orderService.updateOrderStatus(orderId, OrderStatus.PAID);

                    if (transaction != null) {
                        transaction.setStatus(PaymentStatus.SUCCESS);
                        transaction.setResultCode("0");
                        transaction.setMessage("MoMo payment successful");

                        paymentTransactionRepository.save(transaction);
                    }

                    log.info("ORDER {} UPDATED TO PAID", orderId);

                } else {

                    orderService.updateOrderStatus(orderId, OrderStatus.FAILED);

                    if (transaction != null) {
                        transaction.setStatus(PaymentStatus.FAILED);
                        transaction.setMessage("MoMo payment failed");

                        paymentTransactionRepository.save(transaction);
                    }

                    log.info("ORDER {} UPDATED TO FAILED", orderId);
                }
            }

            response.sendRedirect(success ? frontendUrl + "/my-orders?payment=success" : frontendUrl + "/my-orders?payment=failed");

        } catch (Exception e) {

            log.error("MOMO RETURN ERROR", e);

            response.sendRedirect(frontendUrl + "/my-orders?payment=failed");
        }
    }

    @PostMapping("/vnpay")
    public ResponseEntity<PaymentResponse> createVNPay(
            @RequestParam Long orderId,
            HttpServletRequest request,
            Authentication authentication
    ) throws JsonProcessingException {

        orderService.validateOrderForPayment(orderId, getCurrentUserId(authentication), PaymentMethod.VNPAY);


        String ipAddr = getClientIp(request);

        String paymentUrl = vnPaymentService.createVNPayPayment(orderId, "Order " + orderId,
                ipAddr);

        return ResponseEntity.ok(PaymentResponse.success("VNPay payment URL generated", paymentUrl));
    }

    @GetMapping("/vnpay-return")
    public void returnVNPay(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {

        String secureHash = params.get("vnp_SecureHash");

        if (secureHash == null || secureHash.isBlank()) {

            response.sendRedirect(frontendUrl + "/my-orders?payment=failed");

            return;
        }

        boolean valid = vnPaymentService.verifyVNPayChecksum(params, secureHash);

        if (!valid) {

            log.warn("VNPay invalid checksum — params: {}", params);

            response.sendRedirect(frontendUrl + "/my-orders?payment=failed");

            return;
        }

        vnPaymentService.handleVNPayReturn(params);

        String responseCode = params.get("vnp_ResponseCode");

        boolean success = "00".equals(responseCode);

        if (success) {

            response.sendRedirect(frontendUrl + "/my-orders?payment=success");

        } else {

            response.sendRedirect(frontendUrl + "/my-orders?payment=failed");
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip.split(",")[0].trim();
        }
        ip = request.getHeader("X-Real-IP");
        if (ip != null && !ip.isBlank() && !"unknown".equalsIgnoreCase(ip)) {
            return ip;
        }
        return request.getRemoteAddr();
    }

    private String getCurrentUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Unauthorized");
        }

        return userDetails.getUserId();
    }
}
