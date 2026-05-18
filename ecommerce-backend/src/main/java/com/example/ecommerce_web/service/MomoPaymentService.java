package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.MomoPaymentResponse;
import com.example.ecommerce_web.model.OrderStatus;
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
    private final PaymentTransactionRepository transactionRepository;

    private final RestTemplate restTemplate =
            new RestTemplate();

    private final ObjectMapper objectMapper =
            new ObjectMapper();

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

    public MomoPaymentResponse createPayment(
            Long orderId,
            String orderInfo,
            HttpServletRequest request
    ) {

        Long amount =
                orderService.getOrderAmount(orderId);

        if (
                amount == null ||
                        amount < 1000
        ) {

            throw new IllegalArgumentException(
                    "Amount must be >= 1000 VND"
            );
        }

        String uniqueOrderId =
                orderId + "-" + System.currentTimeMillis();

        String requestId =
                String.valueOf(System.currentTimeMillis());

        Map<String, Object> requestBody =
                new HashMap<>();

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

        String signature =
                MomoSignatureUtil.signHmacSHA256(
                        rawSignature,
                        secretKey
                );

        requestBody.put("signature", signature);

        log.info("MOMO REQUEST = {}", requestBody);

        MomoPaymentResponse response =
                restTemplate.postForObject(
                        endpoint,
                        requestBody,
                        MomoPaymentResponse.class
                );

        log.info("MOMO RESPONSE = {}", response);

        PaymentTransaction transaction =
                new PaymentTransaction();

        transaction.setOrderId(orderId);
        transaction.setPaymentGateway("Momo");
        transaction.setTxnRef(uniqueOrderId);
        transaction.setRequestPayload(requestBody.toString());

        transaction.setResponsePayload(
                response != null
                        ? response.toString()
                        : "NULL"
        );

        transaction.setResultCode(
                response != null
                        ? response.getResultCode()
                        : null
        );

        transaction.setMessage(
                response != null
                        ? response.getMessage()
                        : null
        );

        transactionRepository.save(transaction);

        return response;
    }

    @Transactional
    public void handleMomoNotification(
            Map<String, Object> payload
    ) {

        try {

            log.info(
                    "MOMO IPN PAYLOAD = {}",
                    payload
            );

            String receivedSignature =
                    String.valueOf(
                            payload.get("signature")
                    );

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
                    MomoSignatureUtil.signHmacSHA256(
                            rawSignature,
                            secretKey
                    );

            if (
                    !calculatedSignature.equals(
                            receivedSignature
                    )
            ) {

                log.error(
                        "MOMO INVALID SIGNATURE"
                );

                return;
            }

            String resultCode =
                    String.valueOf(
                            payload.get("resultCode")
                    );

            String momoOrderId =
                    String.valueOf(
                            payload.get("orderId")
                    );

            String orderIdStr =
                    momoOrderId.split("-")[0];

            Long orderId =
                    Long.parseLong(orderIdStr);

            log.info(
                    "ORDER ID = {}, RESULT = {}",
                    orderId,
                    resultCode
            );

            OrderStatus currentStatus =
                    orderService.getOrderStatus(orderId);

            if (
                    currentStatus == OrderStatus.PAID ||
                            currentStatus == OrderStatus.FAILED
            ) {

                log.info(
                        "Order already processed"
                );

                return;
            }

            if ("0".equals(resultCode)) {

                orderService.updateOrderStatus(
                        orderId,
                        OrderStatus.PAID
                );

                log.info(
                        "Order {} updated to PAID",
                        orderId
                );

            } else {

                orderService.updateOrderStatus(
                        orderId,
                        OrderStatus.FAILED
                );

                log.info(
                        "Order {} updated to FAILED",
                        orderId
                );
            }

            PaymentTransaction notifyLog =
                    new PaymentTransaction();

            notifyLog.setOrderId(orderId);
            notifyLog.setPaymentGateway("Momo");
            notifyLog.setTxnRef(momoOrderId);

            notifyLog.setRequestPayload(
                    objectMapper.writeValueAsString(payload)
            );

            notifyLog.setResultCode(resultCode);

            notifyLog.setMessage(
                    String.valueOf(
                            payload.get("message")
                    )
            );

            transactionRepository.save(notifyLog);

        } catch (Exception e) {

            log.error(
                    "MOMO NOTIFY ERROR",
                    e
            );
        }
    }
}