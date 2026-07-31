package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    // ----- Editör profili alanları -----
    private String fullName;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String avatarUrl;

    // Public sitede yazarın "yazar sayfası" linki için (örn. /yazar/ceren-gurcan).
    // Boş bırakılabilir; kullanıcı profilini ilk kez düzenlerken belirler.
    @Column(unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}