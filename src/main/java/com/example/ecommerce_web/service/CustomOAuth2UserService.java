package com.example.ecommerce_web.service;

import com.example.ecommerce_web.model.Role;
import com.example.ecommerce_web.model.RoleName;
import com.example.ecommerce_web.model.User;
import com.example.ecommerce_web.model.AuthProvider;
import com.example.ecommerce_web.repository.RoleRepository;
import com.example.ecommerce_web.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;


    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);
        Map<String, Object> attributes = oAuth2User.getAttributes();

        String registrationId = userRequest.getClientRegistration().getRegistrationId(); // "google" hoặc "facebook"
        String userId;
        String name;
        String email;
        String picture;
        AuthProvider provider;

        if ("google".equals(registrationId)) {
            userId = (String) attributes.get("sub");
            name = (String) attributes.get("name");
            email = (String) attributes.get("email");
            picture = (String) attributes.get("picture");
            provider = AuthProvider.GOOGLE;
        } else if ("facebook".equals(registrationId)) {
            userId = (String) attributes.get("id");
            name = (String) attributes.get("name");
            email = (String) attributes.get("email");
            // --- Lấy access token từ userRequest ---
            String token = userRequest.getAccessToken().getTokenValue();

            // --- Gửi request để lấy URL ảnh thật ---
            String pictureApiUrl = "https://graph.facebook.com/" + userId + "/picture?type=large&redirect=false&access_token=" + token;
            RestTemplate restTemplate = new RestTemplate();

            try {
                Map<String, Object> response = restTemplate.getForObject(pictureApiUrl, Map.class);
                if (response != null && response.containsKey("data")) {
                    Map<String, Object> data = (Map<String, Object>) response.get("data");
                    picture = (String) data.get("url");
                } else {
                    picture = "https://graph.facebook.com/" + userId + "/picture?type=large"; // fallback
                }
            } catch (Exception e) {
                picture = "https://graph.facebook.com/" + userId + "/picture?type=large"; // fallback
            }

            provider = AuthProvider.FACEBOOK;
        } else {
            throw new OAuth2AuthenticationException("Unsupported OAuth2 provider: " + registrationId);
        }

        // Tìm user theo email
        Optional<User> optionalUser = userRepository.findByEmail(email);
        User user;

        if (optionalUser.isPresent()) {
            user = optionalUser.get();
            boolean updated = false;

            if (name != null && !name.equals(user.getName())) {
                user.setName(name);
                updated = true;
            }

            if (picture != null && !picture.equals(user.getPicture())) {
                user.setPicture(picture);
                updated = true;
            }

            if (provider != user.getAuthProvider()) {
                user.setAuthProvider(provider);
                updated = true;
            }

            if (updated) {
                userRepository.save(user);
            }
        } else {
            user = new User();
            user.setId(userId);
            user.setUsername(email);
            user.setName(name);
            user.setEmail(email);
            user.setPicture(picture);
            user.setAuthProvider(provider);
            user.setCreatedAt(LocalDateTime.now());
            Role customerRole = roleRepository.findByName(RoleName.ROLE_CUSTOMER)
                    .orElseThrow(() -> new RuntimeException("ROLE_CUSTOMER not found"));
            user.setRoles(Set.of(customerRole));
            userRepository.save(user);
        }

        Set<GrantedAuthority> authorities = user.getRoles().stream()
                .map(role -> new SimpleGrantedAuthority(role.getName().name()))
                .collect(Collectors.toSet());

        return new DefaultOAuth2User(
                authorities,
                attributes,
                registrationId.equals("google") ? "sub" : "id"
        );

    }
}
