package com.example.ecommerce_web.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private JwtTokenProvider jwtTokenProvider;  // Class để generate JWT

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        // Lấy email từ OAuth2User
        String email = oAuth2User.getAttribute("email");

        // Generate JWT Token từ email
        String jwtToken = jwtTokenProvider.generateToken(email);

        // Redirect về Frontend kèm token
        String redirectUrl = "http://localhost:3000/oauth2/redirect?token=" + jwtToken;
        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}
