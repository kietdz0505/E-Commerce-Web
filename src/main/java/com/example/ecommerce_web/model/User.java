package com.example.ecommerce_web.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    private String id;

    private String username;

    @Column(nullable = true) //  Cho phép null vì OAuth2 không có mật khẩu
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
            name = "users_roles",  // CHÍNH XÁC với bảng hiện có
            joinColumns = @JoinColumn(name = "users_id"),
            inverseJoinColumns = @JoinColumn(name = "roles_id")
    )

    private Set<Role> roles;

    public boolean isAdmin() {
        return roles.stream()
                .anyMatch(role -> role.getName() == RoleName.ROLE_ADMIN);
    }


}
