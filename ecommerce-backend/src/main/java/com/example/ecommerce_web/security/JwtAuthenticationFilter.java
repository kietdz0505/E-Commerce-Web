package com.example.ecommerce_web.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Lazy;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(
            @Lazy JwtTokenProvider jwtTokenProvider,
            @Lazy UserDetailsService userDetailsService) {
        this.jwtTokenProvider = jwtTokenProvider;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            String path = request.getServletPath();

            if (path.startsWith("/api/auth")
                    || path.startsWith("/oauth2")
                    || path.startsWith("/login/oauth2")
                    || path.startsWith("/login")) {
                filterChain.doFilter(request, response);
                return;
            }

            String token = getJwtFromRequest(request);

            // Chỉ xử lý nếu lấy được token hợp lệ từ chuỗi Bearer
            if (token != null && jwtTokenProvider.validateToken(token)) {
                String email = jwtTokenProvider.getEmailFromToken(token);

                // CHỐT CHẶN 1: Nếu giải mã token ra trúng chuỗi rỗng hoặc null, dừng lại ngay để tránh crash file sau
                if (email == null || email.trim().isEmpty() || "null".equalsIgnoreCase(email)) {
                    logger.warn("JWT Validated thành công nhưng email giải mã ra bị null/rỗng. Vui lòng check cấu hình JWT Secret.");
                    filterChain.doFilter(request, response);
                    return;
                }

                if (SecurityContextHolder.getContext().getAuthentication() == null) {

                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                    // CHỐT CHẶN 2: Phòng hờ trường hợp hàm loadUserByUsername trả về đối tượng null
                    if (userDetails != null) {
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        userDetails,
                                        null,
                                        userDetails.getAuthorities()
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource().buildDetails(request)
                        );

                        SecurityContextHolder.getContext().setAuthentication(authentication);
                    }
                }
            }

        } catch (Exception e) {
            // SỬA ĐỔI: Thay đổi cách nối chuỗi lỗi để in trọn vẹn StackTrace lên log Render thay vì chữ null cụt lủn
            logger.error("JWT authentication filter critical failed: ", e);
        }
        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }

        return null;
    }
}