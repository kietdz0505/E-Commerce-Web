package com.example.ecommerce_web.controller;

import com.cloudinary.utils.ObjectUtils;
import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.RoleName;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.RoleRepository;
import com.example.ecommerce_web.repository.UserRepository;
import com.example.ecommerce_web.dto.RegisterRequest;
import com.example.ecommerce_web.model.AuthProvider;
import com.example.ecommerce_web.security.JwtTokenProvider;
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

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final CloudinaryService cloudinaryService;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElse(null);

        if (user == null || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid username or password");
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRoles());
        return ResponseEntity.ok(new TokenResponse(token));
    }

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> register(
            @ModelAttribute RegisterRequest request,
            @RequestParam(value = "picture", required = false) MultipartFile pictureFile
    ) {
        System.out.println("Received username: " + request.getUsername());
        System.out.println("Received pictureFile: " + (pictureFile != null ? pictureFile.getOriginalFilename() : "null"));

        if (userRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.badRequest().body("Username đã tồn tại");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            return ResponseEntity.badRequest().body("Email đã tồn tại");
        }

        String passwordPattern = "^(?=.*[0-9])(?=.*[!@#$%^&*()_+\\-\\[\\]{};:'\"\\,.<>?/]).{8,}$";
        if (!request.getPassword().matches(passwordPattern)) {
            return ResponseEntity.badRequest().body(
                    "Mật khẩu phải ít nhất 8 ký tự, chứa ít nhất 1 chữ số và 1 ký tự đặc biệt."
            );
        }

        String pictureUrl = null;
        if (pictureFile != null && !pictureFile.isEmpty()) {
            try {
                pictureUrl = cloudinaryService.uploadImage(pictureFile);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body("Lỗi khi tải ảnh lên");
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

        return ResponseEntity.ok("User registered successfully");
    }



    @GetMapping("/login")
    public String login() {
        return "Redirecting to login...";
    }

    // Dùng cho OAuth2 Login (không ảnh hưởng JWT)
    @GetMapping("/user")
    public OAuth2User getCurrentUser(@AuthenticationPrincipal OAuth2User principal) {
        return principal;
    }

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
}
