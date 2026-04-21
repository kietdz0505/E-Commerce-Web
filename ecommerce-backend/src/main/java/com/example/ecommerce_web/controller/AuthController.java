package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.RegisterRequest;
import com.example.ecommerce_web.model.AuthProvider;
import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.RoleName;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.RoleRepository;
import com.example.ecommerce_web.repository.UserRepository;
import com.example.ecommerce_web.security.JwtTokenProvider;
import com.example.ecommerce_web.service.AuthService;
import com.example.ecommerce_web.service.CloudinaryService;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;
    private final AuthService authService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    // ================= LOGIN =================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Sai tên đăng nhập hoặc mật khẩu"));
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(new TokenResponse(token));
    }

    // ================= REGISTER =================
    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @ModelAttribute RegisterRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile pictureFile
    ) {
        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username đã tồn tại"));
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email đã tồn tại"));
        }

        String passwordPattern = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-\\[\\]{};:'\"\\,.<>?/]).{8,}$";
        if (!request.getPassword().matches(passwordPattern)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải ít nhất 8 ký tự, chứa ít nhất 1 chữ số và 1 ký tự đặc biệt."));
        }

        String pictureUrl = null;
        if (pictureFile != null && !pictureFile.isEmpty()) {
            try {
                pictureUrl = cloudinaryService.uploadImage(pictureFile);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("message", "Lỗi khi tải ảnh lên"));
            }
        }

        User user = new User();
        user.setId(UUID.randomUUID().toString());
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setPicture(pictureUrl);
        user.setAuthProvider(AuthProvider.LOCAL);
        user.setLocked(false);

        Role userRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy vai trò mặc định"));
        user.setRoles(Set.of(userRole));

        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Đăng ký thành công"));
    }

    // ================= PASSWORD RESET FLOW =================

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        authService.sendResetOtp(request.getEmail());
        return ResponseEntity.ok(Map.of("message", "Đã gửi OTP đến email của bạn"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean valid = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (!valid) {
            return ResponseEntity.badRequest().body(Map.of("message", "OTP sai hoặc đã hết hạn"));
        }
        return ResponseEntity.ok(Map.of("message", "OTP hợp lệ"));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu xác nhận không khớp"));
        }

        String passwordPattern = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-\\[\\]{};:'\"\\,.<>?/]).{8,}$";
        if (!request.getNewPassword().matches(passwordPattern)) {
            return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu phải ít nhất 8 ký tự, chứa ít nhất 1 chữ số và 1 ký tự đặc biệt."));
        }

        authService.resetPassword(request.getEmail(), request.getOtp(), request.getNewPassword());
        return ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công"));
    }

    // ================= OAUTH2 SUPPORT =================
    @GetMapping("/login")
    public String login() {
        return "Redirecting to login...";
    }

    @GetMapping("/user")
    public OAuth2User getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        return principal;
    }

    // ================= DTO CLASSES =================
    @Data
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Data
    @AllArgsConstructor
    public static class TokenResponse {
        private String token;
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class VerifyOtpRequest {
        private String email;
        private String otp;
    }

    @Data
    public static class ResetPasswordRequest {
        private String email;
        private String otp;
        private String newPassword;
        private String confirmPassword;
    }
}
