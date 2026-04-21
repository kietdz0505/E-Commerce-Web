package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.OrderStatus;
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

    /**
     * Tạo URL thanh toán VNPay
     */
    public String createVNPayPayment(Long orderId, String orderInfo) {
        // Lấy số tiền đơn hàng
        Long amount = orderService.getOrderAmount(orderId);
        if (amount == null || amount <= 0) {
            throw new IllegalArgumentException("Số tiền đơn hàng không hợp lệ: " + orderId);
        }

        // VNPay yêu cầu amount * 100
        long vnpAmount = amount * 100;

        String vnp_TxnRef = String.valueOf(orderId); // hoặc kết hợp timestamp nếu cần
        String vnp_CreateDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());
        String vnp_IpAddr = "127.0.0.1";

        // Sử dụng TreeMap tự động sắp xếp key
        Map<String, String> vnp_Params = new TreeMap<>();
        vnp_Params.put("vnp_Version", "2.1.0");
        vnp_Params.put("vnp_Command", "pay");
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(vnpAmount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", sanitizeOrderInfo(orderInfo));
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);
        // Optional: hết hạn thanh toán sau 15 phút
        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = new SimpleDateFormat("yyyyMMddHHmmss").format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        vnp_Params.put("vnp_Locale", "vn");
        

        // Tạo hashData và query string
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();

        for (Map.Entry<String, String> entry : vnp_Params.entrySet()) {
            hashData.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
            query.append(entry.getKey()).append("=")
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                    .append("&");
        }

        // Xoá ký tự & thừa
        hashData.deleteCharAt(hashData.length() - 1);
        query.deleteCharAt(query.length() - 1);

        // Tạo chữ ký SHA256
        String secureHash = VNPayUtil.hmacSHA256(vnp_HashSecret, hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        String paymentUrl = vnp_PayUrl + "?" + query;

        // Lưu transaction pending
        PaymentTransaction transaction = new PaymentTransaction();
        transaction.setOrderId(orderId);
        transaction.setPaymentGateway("VNPay");
        transaction.setTxnRef(vnp_TxnRef);
        transaction.setRequestPayload(vnp_Params.toString());
        transaction.setMessage("Pending VNPay Payment");
        transactionRepository.save(transaction);

        System.out.println("=== VNPay Debug Info ===");
        System.out.println("vnp_TmnCode: " + vnp_TmnCode);
        System.out.println("vnp_TxnRef: " + vnp_TxnRef);
        System.out.println("hashData: " + hashData);
        System.out.println("secureHash: " + secureHash);
        System.out.println("Full payment URL: " + paymentUrl);
        System.out.println("========================");

        return paymentUrl;
    }

    /**
     * Lọc ký tự hợp lệ cho vnp_OrderInfo
     */
    private String sanitizeOrderInfo(String orderInfo) {
        return orderInfo.replaceAll("[^a-zA-Z0-9_ ]", "_"); // chỉ chữ, số, _, space
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

        Map<String, String> sorted = new TreeMap<>(cloneParams);
        StringBuilder hashData = new StringBuilder();
        for (Map.Entry<String, String> entry : sorted.entrySet()) {
            hashData.append(entry.getKey()).append("=").append(entry.getValue()).append("&");
        }
        if (hashData.length() > 0) hashData.deleteCharAt(hashData.length() - 1);

        String calculatedHash = VNPayUtil.hmacSHA256(vnp_HashSecret, hashData.toString());
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
