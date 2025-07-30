package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.ChangePasswordDTO;
import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.dto.UserProfileResponseDTO;
import com.example.ecommerce_web.dto.UserProfileUpdateDTO;
import com.example.ecommerce_web.model.AuthProvider;
import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.mapper.UserMapper;
import com.example.ecommerce_web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
@RequiredArgsConstructor
@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public void changePassword(ChangePasswordDTO dto) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getAuthProvider() != AuthProvider.LOCAL) {
            throw new RuntimeException("Tài khoản " + user.getAuthProvider() + " không thể đổi mật khẩu!");
        }

        if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng.");
        }

        user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        userRepository.save(user);
    }

    public Long countAllUsers() {
        return userRepository.count();
    }

    public UserDTO getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(UserMapper::toDTO)
                .orElse(null);
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserMapper::toDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(String id) {
        return userRepository.findById(id)
                .map(UserMapper::toDTO)
                .orElse(null);
    }

    public UserProfileResponseDTO updateProfile(UserProfileUpdateDTO dto) {
        String currentEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setName(dto.getName());
        user.setPhone(dto.getPhone());
        user.setAddress(dto.getAddress());
        if (user.getAuthProvider() == AuthProvider.LOCAL) {
            user.setPicture(dto.getPicture());
        }
        user.setGender(dto.getGender());
        user.setDob(dto.getDob());

        userRepository.save(user);

        User updatedUser = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found after update"));

        // Mapping sang DTO
        UserProfileResponseDTO responseDTO = new UserProfileResponseDTO();
        responseDTO.setId(updatedUser.getId());
        responseDTO.setUsername(updatedUser.getUsername());
        responseDTO.setName(updatedUser.getName());
        responseDTO.setEmail(updatedUser.getEmail());
        responseDTO.setPhone(updatedUser.getPhone());
        responseDTO.setAddress(updatedUser.getAddress());
        responseDTO.setGender(updatedUser.getGender());
        responseDTO.setDob(updatedUser.getDob());
        responseDTO.setPicture(updatedUser.getPicture());
        responseDTO.setAuthProvider(user.getAuthProvider().name());
        responseDTO.setRoles(
                updatedUser.getRoles() != null ?
                        updatedUser.getRoles().stream()
                                .map(role -> role.getName().name())
                                .collect(Collectors.toSet())
                        : Set.of()
        );

        return responseDTO;
    }

    public boolean deleteUser(String id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return true;
        }).orElse(false);
    }
}
