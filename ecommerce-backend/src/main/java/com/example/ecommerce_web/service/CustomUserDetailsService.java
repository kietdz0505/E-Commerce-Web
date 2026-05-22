package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.UserRepository;
import com.example.ecommerce_web.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {

        if (identifier == null || identifier.trim().isEmpty()) {
            throw new UsernameNotFoundException("Tên đăng nhập hoặc Email truyền vào bộ lọc bị null hoặc trống rỗng.");
        }

        String normalized = identifier.trim().toLowerCase();

        User user = userRepository
                .findByEmailOrUsername(normalized, normalized)
                .orElseThrow(() ->
                        new UsernameNotFoundException(
                                "Không tìm thấy người dùng trong Database với thông tin: " + normalized
                        )
                );

        if (user.isLocked()) {
            throw new UsernameNotFoundException(
                    "Tài khoản này đã bị khóa."
            );
        }

        Set<GrantedAuthority> authorities =
                user.getRoles()
                        .stream()
                        .map(role ->
                                new SimpleGrantedAuthority(
                                        role.getName().name()
                                )
                        )
                        .collect(Collectors.toSet());

        // Trong file CustomUserDetailsService.java
        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                user.getPassword(),
                user.isLocked(),
                authorities,
                user.getRoles()
        );
    }
}