package com.example.ecommerce_web.service;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());

        // FIX: Tránh password null
        String password = (user.getPassword() != null && !user.getPassword().isEmpty())
                ? user.getPassword()
                : "N/A";  // tránh null, chỉ cần field này tồn tại

        return new org.springframework.security.core.userdetails.User(
                user.getEmail(),
                password,
                authorities
        );
    }


}

