package com.example.ecommerce_web.service;

import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.dto.UserProfileResponseDTO;
import com.example.ecommerce_web.dto.UserProfileUpdateDTO;
import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.mapper.UserMapper;
import com.example.ecommerce_web.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
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
        user.setGender(dto.getGender());
        user.setDob(dto.getDob());
        user.setPicture(dto.getPicture());

        userRepository.save(user);

        // Mapping User to DTO
        UserProfileResponseDTO responseDTO = new UserProfileResponseDTO();
        responseDTO.setId(user.getId());
        responseDTO.setUsername(user.getUsername());
        responseDTO.setName(user.getName());
        responseDTO.setEmail(user.getEmail());
        responseDTO.setPhone(user.getPhone());
        responseDTO.setAddress(user.getAddress());
        responseDTO.setGender(user.getGender());
        responseDTO.setDob(user.getDob());
        responseDTO.setPicture(user.getPicture());
        responseDTO.setRoles(
                user.getRoles().stream()
                        .map(role -> role.getName().name())
                        .collect(Collectors.toSet())
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
