package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "roles") // Tránh vòng lặp khi in User
@EqualsAndHashCode(of = "id") // So sánh dựa trên id
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {

    @Id
    private String id;

    private String username;

    @Column(nullable = true) // Cho phép null cho OAuth2
    private String password;

    private String name;
    private String email;
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
    private Set<Role> roles;

    @Column(name = "is_locked")
    private boolean locked = false;

    // Kiểm tra quyền admin
    public boolean isAdmin() {
        return roles.stream()
                .anyMatch(role -> role.getName() == RoleName.ROLE_ADMIN); // RoleName là enum
    }

    // Tự động set thời gian khi tạo mới
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    // Tự động set thời gian khi update
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
