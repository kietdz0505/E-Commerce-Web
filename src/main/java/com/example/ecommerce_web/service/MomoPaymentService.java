package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.repository.PaymentTransactionRepository;
import com.example.ecommerce_web.util.MomoSignatureUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MomoPaymentService {

    private final OrderService orderService;
    private final PaymentTransactionRepository transactionRepository;
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

    public MomoPaymentResponse createPayment(Long orderId, Long amountFromClient, String orderInfo) {
        Long amount = orderService.getOrderAmount(orderId); // ✅ LẤY TỪ DB

        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Invalid order amount for orderId: " + orderId);
        }

        String uniqueOrderId = orderId + "-" + System.currentTimeMillis();  // MAKE IT UNIQUE
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

        // RawSignature
        String rawSignature = "accessKey=" + accessKey +
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

        // Logging
        System.out.println("RAW SIGNATURE: " + rawSignature);
        System.out.println("SIGNATURE: " + signature);
        System.out.println("REQUEST BODY: " + requestBody);

        // 👉 FIXED: Gọi API và gán response vào biến
        MomoPaymentResponse response = restTemplate.postForObject(endpoint, requestBody, MomoPaymentResponse.class);

        // 👉 Lưu Transaction Log sau khi có response
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderId(orderId);
        transaction.setPaymentGateway("Momo");
        transaction.setTxnRef(uniqueOrderId);  // orderId-timestamp
        transaction.setRequestPayload(requestBody.toString());
        transaction.setResponsePayload(response != null ? response.toString() : "NULL");
        transaction.setResultCode(response != null ? response.getResultCode() : null);
        transaction.setMessage(response != null ? response.getMessage() : null);
        transactionRepository.save(transaction);

        return response;
    }


    public void handleMomoNotification(Map<String, String> payload) {
        String receivedSignature = payload.get("signature");

        // Build rawSignature from Momo IPN payload (order of fields is IMPORTANT)
        String rawSignature = "accessKey=" + accessKey +
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

        String calculatedSignature = MomoSignatureUtil.signHmacSHA256(rawSignature, secretKey);

        if (!calculatedSignature.equals(receivedSignature)) {
            System.err.println("Momo Notify Invalid Signature: Possible Tampering Detected.");
            return;  // ❗ Không throw exception, chỉ log
        }

        // Extract orderId from orderId-<timestamp>
        String orderIdStr = payload.get("orderId").split("-")[0];
        Long orderId = Long.valueOf(orderIdStr);

        // Idempotency Check
        OrderStatus currentStatus = orderService.getOrderStatus(orderId);
        if (currentStatus == OrderStatus.PAID || currentStatus == OrderStatus.FAILED) {
            System.out.println("Order #" + orderId + " already processed with status: " + currentStatus);
        } else {
            String resultCode = payload.get("resultCode");
            if ("0".equals(resultCode)) {
                orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                System.out.println("Order #" + orderId + " updated to PAID.");
            } else {
                orderService.updateOrderStatus(orderId, OrderStatus.FAILED);
                System.out.println("Order #" + orderId + " updated to FAILED.");
            }
        }

        // Save IPN Notify Log
        try {
            PaymentTransaction notifyLog = new PaymentTransaction();
            notifyLog.setOrderId(orderId);
            notifyLog.setPaymentGateway("Momo");
            notifyLog.setTxnRef(payload.get("orderId"));
            notifyLog.setRequestPayload(objectMapper.writeValueAsString(payload));
            notifyLog.setResultCode(payload.get("resultCode"));
            notifyLog.setMessage(payload.get("message"));
            transactionRepository.save(notifyLog);
        } catch (Exception e) {
            System.err.println("Error saving Momo IPN log: " + e.getMessage());
        }

        // Logging Payload
        System.out.println("Momo Notify Payload: " + payload);
    }

}
