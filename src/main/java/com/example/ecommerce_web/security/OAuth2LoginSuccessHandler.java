package com.example.ecommerce_web.security;

import com.example.ecommerce_web.security.JwtTokenProvider;
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
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private com.example.ecommerce_web.repository.UserRepository userRepository;

    // Thêm dòng này để query user từ DB
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");

        if (email == null || email.isEmpty()) {
            // Trường hợp Facebook không gửi email
            response.setStatus(HttpServletResponse.SC_BAD_REQUEST);
            response.getWriter().write("Email not found from Facebook account");
            response.getWriter().flush();
            return;
        }

        com.example.ecommerce_web.model.User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.isLocked()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.getWriter().write("Account is locked");
            response.getWriter().flush();
            return;
        }

        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRoles());

        String redirectUrl = "https://e-commerce-web-ashy.vercel.app/oauth2/redirect?token=" + token;
        response.sendRedirect(redirectUrl);
    }




}
