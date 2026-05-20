package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.OrderStatus;
import com.example.ecommerce_web.model.PaymentStatus;
import com.example.ecommerce_web.model.PaymentTransaction;
import com.example.ecommerce_web.repository.PaymentTransactionRepository;
import com.example.ecommerce_web.util.VNPayUtil;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class VNPaymentService {

    private final OrderService orderService;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final ObjectMapper objectMapper;

    @Value("${vnpay.tmnCode}")
    private String vnp_TmnCode;

    @Value("${vnpay.hashSecret}")
    private String vnp_HashSecret;

    @Value("${vnpay.payUrl}")
    private String vnp_PayUrl;

    @Value("${vnpay.returnUrl}")
    private String vnp_ReturnUrl;

    @PostConstruct
    public void init() {
        log.info("===== VNPAY CONFIG =====");
        log.info("TMN CODE    = {}", vnp_TmnCode);
        log.info("PAY URL     = {}", vnp_PayUrl);
        log.info("RETURN URL  = {}", vnp_ReturnUrl);

    }

    public String createVNPayPayment(Long orderId, String orderInfo, String ipAddr) throws JsonProcessingException {
        long vnpAmount = orderService.getOrderEntity(orderId).getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();

        String txnRef = String.valueOf(orderId);

        Calendar calendar = Calendar.getInstance(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMddHHmmss");
        sdf.setTimeZone(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

        String createDate = sdf.format(calendar.getTime());
        calendar.add(Calendar.MINUTE, 15);
        String expireDate = sdf.format(calendar.getTime());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnp_TmnCode);
        params.put("vnp_Amount", String.valueOf(vnpAmount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", sanitizeOrderInfo(orderInfo));
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnp_ReturnUrl);
        params.put("vnp_IpAddr", normalizeIp(ipAddr));
        params.put("vnp_CreateDate", createDate);
        params.put("vnp_ExpireDate", expireDate);

        List<String> hashParts = new ArrayList<>();
        List<String> queryParts = new ArrayList<>();

        for (Map.Entry<String, String> entry : params.entrySet()) {
            String encodedValue = URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII);
            hashParts.add(entry.getKey() + "=" + encodedValue);
            queryParts.add(URLEncoder.encode(entry.getKey(), StandardCharsets.US_ASCII) + "=" + encodedValue);
        }

        String hashData = String.join("&", hashParts);
        String queryStr = String.join("&", queryParts);
        String secureHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData);

        String paymentUrl = vnp_PayUrl + "?" + queryStr + "&vnp_SecureHash=" + secureHash;

        log.debug("VNPay hashData   = {}", hashData);
        log.debug("VNPay paymentUrl = {}", paymentUrl);

        PaymentTransaction tx = PaymentTransaction.builder().orderId(orderId).paymentGateway("VNPAY").txnRef(txnRef).requestPayload(objectMapper.writeValueAsString(params)).resultCode("PENDING").message("VNPay payment initiated").status(PaymentStatus.PENDING).build();

        paymentTransactionRepository.save(tx);

        return paymentUrl;
    }

    public boolean verifyVNPayChecksum(Map<String, String> params, String secureHash) {

        Map<String, String> fields = new TreeMap<>(params);
        fields.remove("vnp_SecureHash");
        fields.remove("vnp_SecureHashType");

        List<String> parts = new ArrayList<>();
        for (Map.Entry<String, String> entry : fields.entrySet()) {
            if (entry.getValue() != null && !entry.getValue().isEmpty()) {
                parts.add(entry.getKey() + "=" + URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            }
        }
        String hashData = String.join("&", parts);
        String calculatedHash = VNPayUtil.hmacSHA512(vnp_HashSecret, hashData);

        log.debug("VNPay verify — hashData     = {}", hashData);
        log.debug("VNPay verify — receivedHash = {}", secureHash);
        log.debug("VNPay verify — localHash    = {}", calculatedHash);

        return calculatedHash.equalsIgnoreCase(secureHash);
    }

    @Transactional
    public void handleVNPayReturn(Map<String, String> params) {

        String txnRef = params.get("vnp_TxnRef");
        String responseCode = params.get("vnp_ResponseCode");
        String vnpAmount = params.get("vnp_Amount");
        String transactionNo = params.get("vnp_TransactionNo");

        Long orderId = Long.parseLong(txnRef);

        OrderStatus currentStatus = orderService.getOrderStatus(orderId);
        if (currentStatus == OrderStatus.PAID || currentStatus == OrderStatus.CANCELLED || currentStatus == OrderStatus.FAILED) {
            log.warn("VNPay callback ignored — order {} already in status {}", orderId, currentStatus);
            return;
        }

        long expectedAmount = orderService.getOrderEntity(orderId).getTotalAmount().multiply(java.math.BigDecimal.valueOf(100)).longValue();

        if (vnpAmount != null) {
            long returnedAmount = Long.parseLong(vnpAmount);
            if (returnedAmount != expectedAmount) {
                log.error("VNPay amount mismatch — expected {} but got {} for order {}", expectedAmount, returnedAmount, orderId);
                saveTransaction(orderId, txnRef, transactionNo, "AMOUNT_MISMATCH", params.toString());
                return;
            }
        }

        saveTransaction(orderId, txnRef, transactionNo, responseCode, params.toString());

        if ("00".equals(responseCode)) {
            orderService.updateOrderStatus(orderId, OrderStatus.PAID);
            log.info("VNPay PAYMENT SUCCESS — order {}", orderId);
        } else {
            orderService.updateOrderStatus(orderId, OrderStatus.FAILED);
            log.warn("VNPay PAYMENT FAILED — order {} — code {}", orderId, responseCode);
        }
    }

    private void saveTransaction(Long orderId, String txnRef, String transactionNo, String resultCode, String responsePayload) {

        PaymentTransaction tx = paymentTransactionRepository.findByTxnRef(txnRef).orElse(new PaymentTransaction());

        tx.setOrderId(orderId);
        tx.setPaymentGateway("VNPAY");
        tx.setTxnRef(txnRef);

        tx.setResultCode(resultCode);

        tx.setResponsePayload(responsePayload);

        PaymentStatus status = "00".equals(resultCode) ? PaymentStatus.SUCCESS : PaymentStatus.FAILED;

        tx.setStatus(status);

        tx.setMessage(buildMessage(resultCode, transactionNo));

        paymentTransactionRepository.save(tx);

        log.info("VNPay transaction updated txnRef={}, status={}", txnRef, status);
    }

    private String buildMessage(String resultCode, String transactionNo) {
        if ("00".equals(resultCode)) {
            return "VNPay payment successful - TxnNo: " + transactionNo;
        }

        return "VNPay payment failed - code: " + resultCode;
    }

    private String sanitizeOrderInfo(String orderInfo) {
        return orderInfo.replaceAll("[^a-zA-Z0-9 ]", "_");
    }

    private String normalizeIp(String ipAddr) {
        if (ipAddr == null || ipAddr.equals("0:0:0:0:0:0:0:1") || ipAddr.equals("::1")) {
            return "127.0.0.1";
        }
        return ipAddr;
    }
}