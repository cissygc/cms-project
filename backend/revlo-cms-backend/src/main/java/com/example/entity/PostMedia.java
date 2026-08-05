package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

// Post içeriğinde kullanılan (kapak görseli HARİÇ, o Post.image'da ayrı duruyor)
// birden fazla görseli sıralı şekilde tutar. Basit bir Post<->Media many-to-many
// yerine ayrı bir entity kullanmamızın sebebi: sortOrder ve caption gibi
// ilişkiye özel ekstra bilgi taşıması gerekiyor.
@Entity
@Data
@Table(name = "post_media")
public class PostMedia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "media_id", nullable = false)
    private Media media;

    @Column(nullable = false)
    private Integer sortOrder;

    // Opsiyonel - görsel altı açıklama/alt text
    private String caption;
}