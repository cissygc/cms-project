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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "avatar_media_id")
    private Media avatarMedia;

    // Public sitede yazarın "yazar sayfası" linki için (örn. /yazar/ceren-gurcan).
    // Boş bırakılabilir; kullanıcı profilini ilk kez düzenlerken belirler.
    @Column(unique = true)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    // Soft delete - hesap "silindiğinde" gerçekten silinmiyor, sadece işaretleniyor.
    // Sebep: kullanıcının yazdığı yazılar bağımsız bir değer taşıyor (SEO, okuyucu
    // deneyimi) - hard delete edilirse ya cascade ile yazılar da gider ya da
    // karmaşık bir "yazıları devret" akışı gerekir. Silinmiş kullanıcı: giriş
    // yapamaz, admin listesinde varsayılan gizli; yazıları public API'de
    // görünmeye DEVAM eder (bilinçli karar - içerik yazardan bağımsız yaşar).
    @Column(nullable = false)
    private boolean deleted = false;
}