package com.example.ecommerce_web.security;

import com.example.ecommerce_web.model.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;

public class CustomUserDetails extends User implements OAuth2User {

    private final String userId;
    private final boolean isLocked;
    private final Map<String, Object> attributes;
    private final Set<Role> roles;

    public CustomUserDetails(
            String userId,
            String username,
            String password,
            boolean isLocked,
            Collection<? extends GrantedAuthority> authorities,
            Set<Role> roles
    ) {

        super(
                Objects.requireNonNull(username),
                Objects.requireNonNull(password),
                true,
                true,
                !isLocked,
                true,
                authorities
        );

        this.userId = userId;
        this.isLocked = isLocked;
        this.roles = roles;
        this.attributes = Collections.emptyMap();
    }

    public CustomUserDetails(
            String userId,
            String username,
            String password,
            boolean isLocked,
            Collection<? extends GrantedAuthority> authorities,
            Set<Role> roles,
            Map<String, Object> attributes
    ) {

        super(
                Objects.requireNonNull(username),
                Objects.requireNonNull(password),
                true,
                true,
                !isLocked,
                true,
                authorities
        );

        this.userId = userId;
        this.isLocked = isLocked;
        this.roles = roles;
        this.attributes =
                attributes != null
                        ? attributes
                        : Collections.emptyMap();
    }

    public String getUserId() {
        return userId;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public boolean getIsLocked() {
        return isLocked;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        return getUsername();
    }
}