package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.PaymentStatus;
import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.repository.PaymentTransactionRepository;
import com.example.ecommerce_web.util.MomoSignatureUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class MomoPaymentService {

    private final OrderService orderService;
    private final PaymentTransactionRepository paymentTransactionRepository;

    private final RestTemplate restTemplate = new RestTemplate();

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${momo.partnerCode}")
    private String partnerCode;

    @Value("${momo.accessKey}")
    private String accessKey;

    @Value("${momo.secretKey}")
    private String secretKey;

    @Value("${momo.redirectUrl}")
    private String redirectUrl;

    @Value("${momo.ipnUrl}")
    private String ipnUrl;

    @Value("${momo.endpoint}")
    private String endpoint;

    public MomoPaymentResponse createPayment(Long orderId, String orderInfo, HttpServletRequest request) {

        Long amount = orderService.getOrderAmount(orderId);

        if (amount == null || amount < 1000) {
            throw new IllegalArgumentException("Amount must be >= 1000 VND");
        }

        String uniqueOrderId = orderId + "-" + System.currentTimeMillis();
        String requestId = String.valueOf(System.currentTimeMillis());

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("partnerCode", partnerCode);
        requestBody.put("accessKey", accessKey);
        requestBody.put("requestId", requestId);
        requestBody.put("amount", String.valueOf(amount));
        requestBody.put("orderId", uniqueOrderId);
        requestBody.put("orderInfo", orderInfo);
        requestBody.put("redirectUrl", redirectUrl);
        requestBody.put("ipnUrl", ipnUrl);
        requestBody.put("extraData", "");
        requestBody.put("requestType", "captureWallet");

        String rawSignature =
                "accessKey=" + accessKey +
                        "&amount=" + amount +
                        "&extraData=" +
                        "&ipnUrl=" + ipnUrl +
                        "&orderId=" + uniqueOrderId +
                        "&orderInfo=" + orderInfo +
                        "&partnerCode=" + partnerCode +
                        "&redirectUrl=" + redirectUrl +
                        "&requestId=" + requestId +
                        "&requestType=captureWallet";

        String signature = MomoSignatureUtil.signHmacSHA256(rawSignature, secretKey);
        requestBody.put("signature", signature);

        log.info("MOMO REQUEST = {}", requestBody);

        MomoPaymentResponse response = null;
        String responseJson;

        try {
            response = restTemplate.postForObject(endpoint, requestBody, MomoPaymentResponse.class);

            responseJson = objectMapper.writeValueAsString(response);

        } catch (Exception e) {
            responseJson = "{\"error\":\"" + e.getMessage() + "\"}";
        }

        log.info("MOMO RESPONSE = {}", responseJson);

        // ===== SAVE TRANSACTION =====
        PaymentTransaction transaction = PaymentTransaction.builder()
                .orderId(orderId)
                .paymentGateway("MOMO")
                .txnRef(uniqueOrderId)
                .requestPayload(convertToJson(requestBody))
                .responsePayload(responseJson)
                .resultCode(response != null ? response.getResultCode() : null)
                .message(
                        response != null && "0".equals(response.getResultCode())
                                ? "MoMo payment session created"
                                : response != null
                                ? response.getMessage()
                                : "MoMo request failed"
                )
                .status(response != null && "0".equals(response.getResultCode())
                        ? PaymentStatus.PENDING
                        : PaymentStatus.FAILED)
                .build();

        log.info("UPDATING TX = {}", transaction.getTxnRef());
        log.info("STATUS = {}", transaction.getStatus());
        paymentTransactionRepository.save(transaction);

        return response;
    }

    private String convertToJson(Object obj) {
        try {
            return objectMapper.writeValueAsString(obj);
        } catch (Exception e) {
            return "{}";
        }
    }

    @Transactional
    public void handleMomoNotification(Map<String, Object> payload) {
        log.error("========== MOMO CALLBACK HIT ==========");
        try {
            log.info("MOMO IPN PAYLOAD = {}", payload);

            // ===== 1. VERIFY SIGNATURE =====
            String receivedSignature = (String) payload.get("signature");

            String rawSignature =
                    "accessKey=" + accessKey +
                            "&amount=" + payload.get("amount") +
                            "&extraData=" + payload.get("extraData") +
                            "&message=" + payload.get("message") +
                            "&orderId=" + payload.get("orderId") +
                            "&orderInfo=" + payload.get("orderInfo") +
                            "&orderType=" + payload.get("orderType") +
                            "&partnerCode=" + payload.get("partnerCode") +
                            "&payType=" + payload.get("payType") +
                            "&requestId=" + payload.get("requestId") +
                            "&responseTime=" + payload.get("responseTime") +
                            "&resultCode=" + payload.get("resultCode") +
                            "&transId=" + payload.get("transId");

            String calculatedSignature =
                    MomoSignatureUtil.signHmacSHA256(rawSignature, secretKey);

            if (receivedSignature == null || !calculatedSignature.equals(receivedSignature)) {
                log.error("MOMO INVALID SIGNATURE");
                return;
            }

            String resultCode = String.valueOf(payload.get("resultCode"));
            String momoOrderId = String.valueOf(payload.get("orderId"));
            String orderIdStr = momoOrderId.split("-")[0];
            Long orderId = Long.parseLong(orderIdStr);

            log.info("ORDER ID = {}, RESULT = {}", orderId, resultCode);

            boolean success = "0".equals(resultCode);
            OrderStatus currentStatus = orderService.getOrderStatus(orderId);

            if (currentStatus != OrderStatus.PAID
                    && currentStatus != OrderStatus.FAILED) {

                OrderStatus newStatus = success
                        ? OrderStatus.PAID
                        : OrderStatus.FAILED;

                orderService.updateOrderStatus(orderId, newStatus);

                log.info("Order {} updated to {}", orderId, newStatus);
            }

            updateTransaction(
                    orderId,
                    momoOrderId,
                    resultCode,
                    objectMapper.writeValueAsString(payload),
                    String.valueOf(payload.get("message"))
            );

        } catch (Exception e) {
            log.error("MOMO IPN ERROR", e);
        }
    }

    private void updateTransaction(Long orderId, String txnRef, String resultCode, String responsePayload, String momoMessage) {
        PaymentTransaction tx =
                paymentTransactionRepository.findByTxnRef(txnRef)
                        .orElse(new PaymentTransaction());

        tx.setOrderId(orderId);

        tx.setPaymentGateway("MOMO");

        tx.setTxnRef(txnRef);

        tx.setResultCode(resultCode);

        tx.setResponsePayload(responsePayload);

        PaymentStatus status =
                "0".equals(resultCode)
                        ? PaymentStatus.SUCCESS
                        : PaymentStatus.FAILED;

        tx.setStatus(status);

        tx.setMessage(buildMessage(resultCode, momoMessage));

        paymentTransactionRepository.save(tx);

        log.info(
                "MoMo transaction updated txnRef={}, status={}",
                txnRef,
                status
        );
    }

    private String buildMessage(String resultCode, String momoMessage) {
        if ("0".equals(resultCode)) {

            return "MoMo payment successful";
        }

        return "MoMo payment failed: " + momoMessage;
    }
}