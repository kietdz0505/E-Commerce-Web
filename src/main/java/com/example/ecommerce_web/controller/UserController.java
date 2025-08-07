package com.example.ecommerce_web.controller;

import com.example.ecommerce_web.dto.ChangePasswordDTO;
import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.dto.UserProfileResponseDTO;
import com.example.ecommerce_web.dto.UserProfileUpdateDTO;
import com.example.ecommerce_web.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    private final UserService userService;

    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponseDTO> updateProfile(@RequestBody UserProfileUpdateDTO dto) {
        UserProfileResponseDTO updatedUser = userService.updateProfile(dto);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/me")
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Chưa đăng nhập");
        }

        String email = authentication.getName();
        return userService.getUserByEmail(email);
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordDTO dto) {
        userService.changePassword(dto);
        return ResponseEntity.ok("Đổi mật khẩu thành công.");
    }

    @GetMapping("/me/roles")
    public List<String> getCurrentUserRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());
    }
}
