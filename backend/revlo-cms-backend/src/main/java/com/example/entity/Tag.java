package com.example.entity;

import jakarta.persistence.*;
import lombok.Data;

// Collection'dan farkı: ADMIN onayı gerektirmez, editör yazı yazarken serbestçe
// yeni bir tag ismi girip anında oluşturabilir (bkz. PostServiceImpl.resolveTags
// - "find or create" mantığı). Collections ise önceden ADMIN tarafından
// tanımlanmış sabit bir taksonomidir.
@Entity
@Data
@Table(name = "tags")
public class Tag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String slug;
}