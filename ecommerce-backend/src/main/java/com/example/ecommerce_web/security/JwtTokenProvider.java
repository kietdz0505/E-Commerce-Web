package com.example.ecommerce_web.security;

import com.example.ecommerce_web.model.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-expiration}")
    private long accessExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
    }

    // ================= ACCESS TOKEN =================
    public String generateAccessToken(String userId, String email, Set<Role> roles) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessExpiration);

        var roleNames = roles.stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toList());

        return Jwts.builder()
                .setSubject(email)
                .claim("userId", userId)
                .claim("roles", roleNames)
                .setIssuer("ecommerce-app")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // ================= REFRESH TOKEN =================
    public String generateRefreshToken(String userId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshExpiration);

        return Jwts.builder()
                .setSubject(userId)
                .setIssuer("ecommerce-app")
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    // ================= EXTRACT =================
    public String getUserIdFromToken(String token) {
        return getClaims(token).get("userId", String.class);
    }

    public String getEmailFromToken(String token) {
        return getClaims(token).getSubject();
    }

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ================= VALIDATE =================
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;

        } catch (ExpiredJwtException e) {
            logger.error("JWT expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.error("JWT unsupported: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.error("JWT malformed: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.error("JWT invalid signature: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            logger.error("JWT empty or null: {}", e.getMessage());
        }

        return false;
    }
}