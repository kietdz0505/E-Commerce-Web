package com.example.ecommerce_web.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.Collections;
import java.util.Map;

public class CustomUserDetails extends User implements OAuth2User {

    private final String userId;
    private final boolean isLocked;
    private final Map<String, Object> attributes;

    // Constructor dành cho UserDetailsService (không có attributes)
    public CustomUserDetails(
            String userId,
            String username,
            String password,
            boolean isLocked,
            Collection<? extends GrantedAuthority> authorities
    ) {
        super(username, password, true, true, !isLocked, true, authorities);
        this.userId = userId;
        this.isLocked = isLocked;
        this.attributes = Collections.emptyMap();
    }

    // Constructor dành cho OAuth2User (có attributes)
    public CustomUserDetails(
            String userId,
            String username,
            String password,
            boolean isLocked,
            Collection<? extends GrantedAuthority> authorities,
            Map<String, Object> attributes
    ) {
        super(username, password, true, true, !isLocked, true, authorities);
        this.userId = userId;
        this.isLocked = isLocked;
        this.attributes = attributes != null ? attributes : Collections.emptyMap();
    }

    public String getUserId() {
        return userId;
    }

    public boolean getIsLocked() {
        return isLocked;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    // OAuth2User interface method
    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    // OAuth2User interface method
    @Override
    public String getName() {
        return getUsername();
    }
}
