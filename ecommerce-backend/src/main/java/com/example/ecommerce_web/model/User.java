package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"roles", "userPromotions"})
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    @EqualsAndHashCode.Include
    private String id;

    private String username;

    @Column(nullable = true)
    private String password;

    private String name;
    private String email;

    @Column(columnDefinition = "TEXT")
    private String picture;

    private String phone;
    private String address;
    private String gender;
    private LocalDate dob;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    private AuthProvider authProvider;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "users_roles",
            joinColumns = @JoinColumn(name = "users_id"),
            inverseJoinColumns = @JoinColumn(name = "roles_id")
    )
    private Set<Role> roles = new HashSet<>();

    @Column(name = "is_locked")
    private boolean locked = false;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserPromotion> userPromotions = new HashSet<>();

    // ====== Bổ sung cho quên mật khẩu ======
    private String resetOtp;

    private LocalDateTime resetOtpExpiry;

    // ====== Helper ======
    public boolean isAdmin() {
        return roles.stream().anyMatch(role -> role.getName() == RoleName.ROLE_ADMIN);
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
