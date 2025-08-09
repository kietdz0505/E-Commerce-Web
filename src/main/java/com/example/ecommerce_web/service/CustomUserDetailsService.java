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
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toSet());

        String password = (user.getPassword() != null && !user.getPassword().isEmpty())
                ? user.getPassword()
                : "N/A";

        // Truyền isLocked vào CustomUserDetails để Spring Security chặn nếu bị khóa
        return new CustomUserDetails(
                user.getId(),
                user.getEmail(),
                password,
                user.isLocked(), // true = bị khóa, false = không khóa
                authorities
        );
    }
}
