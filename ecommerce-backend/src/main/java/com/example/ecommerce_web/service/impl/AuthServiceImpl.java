package com.example.ecommerce_web.service.impl;

import com.example.ecommerce_web.dto.*;
import com.example.ecommerce_web.exception.AppException;
import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.RefreshTokenRepository;
import com.example.ecommerce_web.repository.RoleRepository;
import com.example.ecommerce_web.repository.UserRepository;
import com.example.ecommerce_web.security.CustomUserDetails;
import com.example.ecommerce_web.security.JwtTokenProvider;
import com.example.ecommerce_web.service.AuthService;
import com.example.ecommerce_web.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.util.Date;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CloudinaryService cloudinaryService;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    // ================= LOGIN =================
    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {

        Authentication authentication;

        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new AppException("Sai username hoặc password");
        }

        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();

        if (!user.isAccountNonLocked()) {
            throw new AppException("Tài khoản đã bị khóa");
        }

        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getUserId(),
                user.getUsername(),
                user.getRoles()
        );

        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());

        saveRefreshToken(user.getUserId(), refreshToken);

        return new AuthResponse(accessToken, refreshToken);
    }

    // ================= REGISTER =================
    @Override
    @Transactional
    public void register(RegisterRequest request, MultipartFile picture) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException("Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new AppException("Email đã tồn tại");
        }

        String pictureUrl = null;

        if (picture != null && !picture.isEmpty()) {
            pictureUrl = cloudinaryService.uploadImage(picture);
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

        Role role = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                .orElseThrow(() -> new AppException("Role không tồn tại"));

        user.setRoles(Set.of(role));

        userRepository.save(user);
    }

    // ================= REFRESH TOKEN =================
    @Override
    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {

        String token = request.getRefreshToken();

        RefreshToken stored = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new AppException("Refresh token không hợp lệ"));

        if (stored.getExpiryDate().before(new Date())) {
            refreshTokenRepository.delete(stored);
            throw new AppException("Refresh token đã hết hạn");
        }

        User user = userRepository.findById(stored.getUserId())
                .orElseThrow(() -> new AppException("User không tồn tại"));

        if (user.isLocked()) {
            throw new AppException("Tài khoản đã bị khóa");
        }

        refreshTokenRepository.delete(stored);

        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());
        saveRefreshToken(user.getId(), newRefreshToken);

        String newAccessToken = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRoles()
        );

        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    // ================= SAVE REFRESH =================
    private void saveRefreshToken(String userId, String token) {

        refreshTokenRepository.deleteByUserId(userId);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUserId(userId);
        refreshToken.setToken(token);
        refreshToken.setExpiryDate(new Date(System.currentTimeMillis() + refreshExpiration));

        refreshTokenRepository.save(refreshToken);
    }

    // ================= LOGOUT =================
    @Override
    @Transactional
    public void logout(String userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    // ================= OTP =================
    @Override
    public void sendResetOtp(String email) {
        throw new AppException("Chức năng chưa hỗ trợ");
    }

    @Override
    public void verifyOtpOrThrow(String email, String otp) {
        throw new AppException("Chức năng chưa hỗ trợ");
    }

    // ================= RESET PASSWORD =================
    @Override
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new AppException("Mật khẩu xác nhận không khớp");
        }

        verifyOtpOrThrow(request.getEmail(), request.getOtp());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException("User không tồn tại"));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    // ================= ROLE MAPPER =================
    private Set<String> mapRolesToAuthorities(Set<Role> roles) {
        return roles.stream()
                .map(r -> "ROLE_" + r.getName().name())
                .collect(Collectors.toSet());
    }
}