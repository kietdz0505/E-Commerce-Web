package com.example.ecommerce_web.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

public class CustomUserDetails extends User {
    private String userId;

    public CustomUserDetails(String userId, String username, String password, Collection<? extends GrantedAuthority> authorities) {
        super(username, password, authorities);
        this.userId = userId;
    }

    public String getId() {
        return userId;
    }

    public String getUserId() {
        return userId;
    }
}
