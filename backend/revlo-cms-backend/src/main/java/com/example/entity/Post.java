package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Data
@Table(name = "posts")
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    private String title;

    // Decap'ten gelecek olan medya URL'ini tutacağımız alan
    private String image;

    @Column(columnDefinition = "TEXT")
    private String content;

    // Onay akışı yok, editör kendi yazısını direkt yayınlayabilir.
    // Varsayılan DRAFT - editör bilerek yayınlamadıkça yazı public API'de görünmez.
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PostStatus status = PostStatus.DRAFT;

    // Yazının dili - site tr/en/de/ru dillerinde yayında. Belirtilmezse TR varsayılır
    // (bkz. PostServiceImpl.parseLanguage).
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Language language = Language.TR;

    // Bir yazı birden fazla koleksiyona (kategoriye) ait olabilir.
    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "post_collections",
            joinColumns = @JoinColumn(name = "post_id"),
            inverseJoinColumns = @JoinColumn(name = "collection_id")
    )
    private java.util.Set<Collection> collections = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    // Post içeriğinde kullanılan sıralı görseller (kapak görseli hariç - o "image" alanında).
    // orphanRemoval=true: post.getMedia().clear() ya da listeyi yeniden set etmek,
    // eski PostMedia satırlarını otomatik siler (medya dosyasının kendisi silinmez, sadece ilişki).
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sortOrder ASC")
    private List<PostMedia> media = new java.util.ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}