package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.*;
import org.springframework.web.multipart.MultipartFile;

public interface AuthService {

    // ================= LOGIN =================
    AuthResponse login(LoginRequest request);


    // ================= REGISTER =================
    void register(RegisterRequest request, MultipartFile picture);


    // ================= REFRESH TOKEN =================
    AuthResponse refreshToken(RefreshTokenRequest request);

    // ================= LOGOUT =================
    void logout(String userId);

    void sendResetOtp(String email);

    void verifyOtpOrThrow(String email, String otp);

    void resetPassword(ResetPasswordRequest request);

}