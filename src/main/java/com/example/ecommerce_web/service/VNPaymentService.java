package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.repository.PaymentTransactionRepository;
import com.example.ecommerce_web.util.VNPayUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class VNPaymentService {

    private final PaymentTransactionRepository transactionRepository;
    private final OrderService orderService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.payUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    public String createVNPayPayment(Long orderId, String orderInfo) {
        // Log input parameters
        System.out.println("Debug - Starting createVNPayPayment with orderId: " + orderId + ", orderInfo: " + orderInfo);

        Long amount = orderService.getOrderAmount(orderId);
        if (amount == null || amount <= 0) {
            System.out.println("Debug - Invalid amount for orderId: " + orderId + ", amount: " + amount);
            throw new IllegalArgumentException("Số tiền đơn hàng không hợp lệ cho orderId: " + orderId);
        }

        orderInfo = "Thanh_toan_don_hang_" + orderId; // Định dạng đã được làm sạch
        System.out.println("Debug - Sanitized orderInfo: " + orderInfo);

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderType = "other";
        String vnp_TxnRef = String.valueOf(System.currentTimeMillis());
        String vnp_IpAddr = "127.0.0.1";
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount * 100)); // Đảm bảo số tiền dương
        if (amount * 100 > 100000000000L) {
            System.out.println("Debug - Amount exceeds limit: " + (amount * 100));
            throw new IllegalArgumentException("Số tiền vượt quá giới hạn của VNPay");
        }
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl + "?orderId=" + orderId); // Đảm bảo URL hợp lệ
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_Locale", "vn");

        // Log all parameters
        System.out.println("Debug - vnp_Params: " + vnp_Params);

        // Kiểm tra Return URL
        if (!vnp_ReturnUrl.startsWith("http")) {
            System.out.println("Debug - Invalid vnp_ReturnUrl: " + vnp_ReturnUrl);
            throw new IllegalArgumentException("vnp_ReturnUrl phải bắt đầu bằng http hoặc https");
        }

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        try {
            for (String fieldName : fieldNames) {
                String fieldValue = vnp_Params.get(fieldName);
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    hashData.append(fieldName).append('=').append(fieldValue).append('&');
                    query.append(fieldName).append('=').append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8.toString())).append('&');
                }
            }

            hashData.deleteCharAt(hashData.length() - 1);  // Remove last '&'
            query.deleteCharAt(query.length() - 1);        // Remove last '&'

            // Log hash data before hashing
            System.out.println("Debug - HashData before hashing: " + hashData.toString());

            String secureHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData.toString());
            System.out.println("Debug - Generated SecureHash: " + secureHash);

            query.append("&vnp_SecureHash=").append(secureHash); // Đảm bảo có dấu '='

            // Save Transaction Log
            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setOrderId(orderId);
            transaction.setPaymentGateway("VNPay");
            transaction.setTxnRef(vnp_TxnRef);
            transaction.setRequestPayload(vnp_Params.toString());
            transaction.setResultCode(null);  // Chưa có response từ VNPay
            transaction.setMessage("Pending VNPay Payment");
            transactionRepository.save(transaction);
            System.out.println("Debug - Transaction saved with txnRef: " + vnp_TxnRef);

            // Logging final URL
            String paymentUrl = vnp_PayUrl + "?" + query.toString();
            System.out.println("Debug - Final Payment URL: " + paymentUrl);

            return paymentUrl;

        } catch (Exception e) {
            System.out.println("Debug - Exception occurred: " + e.getMessage());
            throw new RuntimeException("Error generating VNPay URL", e);
        }
    }

    public Long getOrderIdFromTxnRef(String txnRef) {
        return transactionRepository.findByTxnRef(txnRef)
                .map(PaymentTransaction::getOrderId)
                .orElse(null);
    }

    public boolean verifyVNPayChecksum(Map<String, String> params, String receivedSecureHash) {
        Map<String, String> cloneParams = new HashMap<>(params);
        cloneParams.remove("vnp_SecureHash");
        cloneParams.remove("vnp_SecureHashType");

        List<String> fieldNames = new ArrayList<>(cloneParams.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        for (String fieldName : fieldNames) {
            String fieldValue = cloneParams.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=').append(fieldValue).append('&');
            }
        }
        hashData.deleteCharAt(hashData.length() - 1);

        String calculatedHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData.toString());
        return calculatedHash.equals(receivedSecureHash);
    }

    public void handleVNPayReturn(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String message = params.get("vnp_OrderInfo");

        transactionRepository.findByTxnRef(txnRef).ifPresent(transaction -> {
            try {
                transaction.setResponsePayload(objectMapper.writeValueAsString(params));
                transaction.setResultCode(responseCode);
                transaction.setMessage(message);
                transactionRepository.save(transaction);
                System.out.println("Debug - VNPay return handled for txnRef: " + txnRef + ", responseCode: " + responseCode);
            } catch (Exception e) {
                System.err.println("Debug - Error saving VNPay return log: " + e.getMessage());
            }
        });
    }
}