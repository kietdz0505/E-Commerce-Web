package com.example.ecommerce_web.mapper;
import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.User;

import java.util.Set;
import java.util.stream.Collectors;

public class UserMapper {
    public static UserDTO toDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPicture(user.getPicture());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setGender(user.getGender());
        dto.setAuthProvider(user.getAuthProvider());
        dto.setDob(user.getDob());
        Set<Role> roles = user.getRoles();

        Set<String> roleNames = roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet());

        dto.setRoles(roleNames);



        return dto;
    }
}

