package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name = "media")
public class Media {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String fileName; // Kullanıcıya gösterilen orijinal dosya adı

    private String storedFileName;

    @Column(nullable = false)
    private String fileUrl; // CMS'in görseli arayüzde göstermek için kullanacağı URL

    private String fileType;

    private Long fileSize;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Sadece yükleyen kullanıcı görebilsin kuralı için User ile ilişki kuruyoruz
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}