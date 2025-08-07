package com.example.ecommerce_web.security;

import com.example.ecommerce_web.model.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final String SECRET_KEY = "x9BqK7pD5Yc3MvWzV4Xt7fAqP1NzQwRgL6Js4ThY8Du2FrHtSeCvBnLaKwPo1XyZ"; // 64 ký tự
    private static final long EXPIRATION_TIME = 86400000; // 1 ngày

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }

    // Tạo token từ userId và email
    public String generateToken(String userId, String email, Set<Role> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        // Thêm "ROLE_" prefix để tương thích với Spring Security
        var roleNames = roles.stream()
                .map(role -> "ROLE_" + role.getName().name())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("roles", roleNames)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // Lấy userId từ token
    public String getUserIdFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.get("userId", String.class);
    }

    // Lấy email từ token
    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    // Kiểm tra token hợp lệ
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Invalid JWT: " + e.getMessage());
            return false;
        }
    }

}
