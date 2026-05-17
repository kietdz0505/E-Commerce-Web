package com.example.ecommerce_web.security;

import com.example.ecommerce_web.model.*;
import com.example.ecommerce_web.repository.RoleRepository;
import com.example.ecommerce_web.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtTokenProvider jwtTokenProvider;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String rawEmail = oAuth2User.getAttribute("email");

        if (rawEmail == null || rawEmail.isEmpty()) {
            String facebookId = oAuth2User.getAttribute("id");
            rawEmail = "fb_" + facebookId + "@facebook.local";
        }

        final String finalEmail = rawEmail;

        User user = userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setId(UUID.randomUUID().toString());
                    newUser.setEmail(finalEmail);
                    newUser.setUsername(finalEmail);

                    String name = oAuth2User.getAttribute("name");
                    newUser.setName(name != null ? name : "OAuth2 User");

                    newUser.setPassword(null);

                    Role role = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found"));

                    newUser.setRoles(Collections.singleton(role));
                    newUser.setLocked(false);

                    return userRepository.save(newUser);
                });

        if (user.isLocked()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account is locked");
            return;
        }

        String token = jwtTokenProvider.generateAccessToken(
                user.getId(),
                user.getEmail(),
                user.getRoles()
        );

        response.sendRedirect(frontendUrl + "/oauth2/redirect?token=" + token);
    }
}