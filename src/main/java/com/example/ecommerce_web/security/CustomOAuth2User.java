package com.example.ecommerce_web.security;

import com.example.ecommerce_web.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;
import java.util.stream.Collectors;

public class CustomOAuth2User implements OAuth2User {

    private OAuth2User oAuth2User;
    private String userId;
    private String email;
    private Set<Role> roles;

    public CustomOAuth2User(OAuth2User oAuth2User, String userId, String email, Set<Role> roles) {
        this.oAuth2User = oAuth2User;
        this.userId = userId;
        this.email = email;
        this.roles = roles;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return oAuth2User.getAttributes();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return roles.stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.getName().name()))
                .collect(Collectors.toList());
    }

    @Override
    public String getName() {
        return oAuth2User.getAttribute("name");
    }

    public String getEmail() {
        return email;
    }

    public String getUserId() {
        return userId;
    }

    public Set<Role> getRoles() {
        return roles;
    }
}
