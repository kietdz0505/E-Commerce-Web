package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.common.ApiResponse;
import com.example.ecommerce_web.dto.*;
import com.example.ecommerce_web.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @RequestBody @Valid LoginRequest request
    ) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ================= REGISTER =================
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<String>> register(
            @ModelAttribute @Valid RegisterRequest request,
            @RequestParam(required = false) MultipartFile picture
    ) {
        authService.register(request, picture);
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công"));
    }

    // ================= REFRESH TOKEN =================
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refreshToken(
            @RequestBody RefreshTokenRequest request
    ) {
        AuthResponse response = authService.refreshToken(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    // ================= FORGOT PASSWORD =================
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request
    ) {
        authService.sendResetOtp(request.getEmail());
        return ResponseEntity.ok(ApiResponse.success("Đã gửi OTP đến email của bạn"));
    }

    // ================= VERIFY OTP =================
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<String>> verifyOtp(
            @RequestBody @Valid VerifyOtpRequest request
    ) {
        authService.verifyOtpOrThrow(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(ApiResponse.success("OTP hợp lệ"));
    }

    // ================= RESET PASSWORD =================
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<String>> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request
    ) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đặt lại mật khẩu thành công"));
    }

    // ================= OAUTH2 USER =================
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Object>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User principal
    ) {
        return ResponseEntity.ok(ApiResponse.success(principal));
    }
}