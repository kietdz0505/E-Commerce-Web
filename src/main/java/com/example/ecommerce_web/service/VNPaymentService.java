package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.repository.PaymentTransactionRepository;
import com.example.ecommerce_web.util.VNPayUtil;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
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

    @Value("${vnpay.secretKey}")
    private String vnp_HashSecret;

    @Value("${vnpay.payUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createVNPayPayment(Long orderId, String orderInfo) {
        Long amount = orderService.getOrderAmount(orderId);
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Số tiền đơn hàng không hợp lệ cho orderId: " + orderId);
        }

        long vnpAmount = amount * 100; // VNPay yêu cầu nhân 100

        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderType = "other";
        String vnp_TxnRef = orderId + "_" + System.currentTimeMillis();
        String vnp_IpAddr = "127.0.0.1";
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

        // ExpireDate 15 phút
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime());

        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", orderInfo);
        vnp_Params.put("vnp_OrderType", vnp_OrderType);
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);
        vnp_Params.put("vnp_Locale", "vn");

        // Sắp xếp key để tạo hash
        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (String fieldName : fieldNames) {
            String fieldValue = vnp_Params.get(fieldName);
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append("=").append(fieldValue).append("&");
                query.append(fieldName).append("=").append(URLEncoder.encode(fieldValue, StandardCharsets.UTF_8)).append("&");
            }
        }

        if (hashData.length() > 0) hashData.deleteCharAt(hashData.length() - 1);
        if (query.length() > 0) query.deleteCharAt(query.length() - 1);

        // Tạo chữ ký
        String secureHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnp_PayUrl + "?" + query;

        // Lưu transaction
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderId(orderId);
        transaction.setPaymentGateway("VNPay");
        transaction.setTxnRef(vnp_TxnRef);
        transaction.setRequestPayload(vnp_Params.toString());
        transaction.setMessage("Pending VNPay Payment");
        transactionRepository.save(transaction);

        return paymentUrl;
    }

    /**
     * Lấy orderId từ txnRef
     */
    public Long getOrderIdFromTxnRef(String txnRef) {
        if (txnRef == null || !txnRef.contains("_")) return null;
        try {
            return Long.parseLong(txnRef.split("_")[0]);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    /**
     * Verify checksum từ VNPay
     */
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
                hashData.append(fieldName).append("=").append(fieldValue).append("&");
            }
        }
        if (hashData.length() > 0) hashData.deleteCharAt(hashData.length() - 1);

        String calculatedHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData.toString());
        return calculatedHash.equalsIgnoreCase(receivedSecureHash);
    }

    /**
     * Xử lý khi VNPay redirect về
     */
    public void handleVNPayReturn(Map<String, String> params) {
        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        Long orderId = getOrderIdFromTxnRef(txnRef);

        transactionRepository.findByTxnRef(txnRef).ifPresent(transaction -> {
            try {
                transaction.setResponsePayload(objectMapper.writeValueAsString(params));
                transaction.setResultCode(responseCode);
                transaction.setMessage("VNPay response: " + responseCode);
                transactionRepository.save(transaction);

                if ("00".equals(responseCode)) {
                    orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                } else {
                    orderService.updateOrderStatus(orderId, OrderStatus.FAILED);
                }
            } catch (Exception e) {
                System.err.println("Error saving VNPay return log: " + e.getMessage());
            }
        });
    }
}
