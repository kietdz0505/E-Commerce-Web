package com.example.ecommerce_web.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication)
            throws IOException, ServletException {

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();

        if (userDetails.getIsLocked()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account is locked");
            return;
        }

        String token = jwtTokenProvider.generateAccessToken(
                userDetails.getUserId(),
                userDetails.getUsername(),
                userDetails.getRoles()
        );

        String redirectUrl = frontendUrl + "/oauth2/redirect?token=" + token;
        response.sendRedirect(redirectUrl);
    }
}