package com.example.controller;

import com.example.dto.PostRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/entries/posts")
public interface IPostController {

    // Tüm yazıları listeleme (Decap CMS koleksiyon ekranı için) - sadece kendi yazıları (ADMIN hepsini görür)
    @GetMapping
    ResponseEntity<?> getAllPosts(Authentication authentication);

    // Tek bir yazıyı slug ile getirme (Decap CMS yazı düzenleme ekranı için)
    @GetMapping("/{slug}")
    ResponseEntity<?> getPostBySlug(@PathVariable String slug, Authentication authentication);

    // Yeni yazı oluşturma
    @PostMapping
    ResponseEntity<?> createPost(@Valid @RequestBody PostRequestDto postRequestDto, Authentication authentication);

    // Mevcut yazıyı güncelleme
    @PutMapping("/{slug}")
    ResponseEntity<?> updatePost(@PathVariable String slug, @Valid @RequestBody PostRequestDto postRequestDto, Authentication authentication);

    // Yazıyı silme
    @DeleteMapping("/{slug}")
    ResponseEntity<?> deletePost(@PathVariable String slug, Authentication authentication);
}