package com.example.ecommerce_web.repository;

import com.example.ecommerce_web.dto.UserDTO;
import com.example.ecommerce_web.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findById(String id);
    Optional<User> findByEmailOrUsername(
            String email,
            String username
    );
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);

}
