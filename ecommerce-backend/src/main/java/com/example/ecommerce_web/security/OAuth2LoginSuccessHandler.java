package com.example.ecommerce_web.security;

import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.RoleName;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.repository.RoleRepository;
import com.example.ecommerce_web.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Collections;

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

        // Nếu Facebook không trả email thì tạo email giả
        if (rawEmail == null || rawEmail.isEmpty()) {
            String facebookId = oAuth2User.getAttribute("id");
            rawEmail = "fb_" + facebookId + "@facebook.local";
        }

        final String finalEmail = rawEmail;
        final OAuth2User finalOAuth2User = oAuth2User;

        // Lấy user hoặc tạo mới
        User user = userRepository.findByEmail(finalEmail)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setEmail(finalEmail);

                    String name = finalOAuth2User.getAttribute("name");
                    if (name == null || name.isEmpty()) {
                        name = "Facebook User";
                    }
                    newUser.setName(name);

                    newUser.setPassword(null); // OAuth2 user => không set password

                    Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                            .orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found"));
                    newUser.setRoles(Collections.singleton(customerRole));

                    return userRepository.save(newUser);
                });

        // Nếu tài khoản bị khóa
        if (user.isLocked()) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account is locked");
            return;
        }

        // Tạo token và redirect về FE
        String token = jwtTokenProvider.generateToken(user.getId(), user.getEmail(), user.getRoles());
        response.sendRedirect(frontendUrl + "/oauth2/redirect?token=" + token);

    }

}
