package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ChangePasswordDTO;
import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.dto.UserProfileResponseDTO;
import com.example.ecommerce_web.dto.UserProfileUpdateDTO;
import com.example.ecommerce_web.mapper.UserMapper;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @GetMapping
    public List<UserDTO> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public UserDTO getUserById(@PathVariable String id) {
        return userService.getUserById(id);
    }

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(@RequestBody UserProfileUpdateDTO dto) {
        UserProfileResponseDTO updatedUser = userService.updateProfile(dto);
        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
    }
    @GetMapping("/count")
    public Long getUserCount() {
        return userService.countAllUsers();
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Chưa đăng nhập");
        }

        String email = authentication.getName();
        UserDTO dto = userService.getUserByEmail(email);
        return dto;
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO dto) {
        userService.changePassword(dto);
        return ResponseEntity.ok("Đổi mật khẩu thành công.");
    }
}
