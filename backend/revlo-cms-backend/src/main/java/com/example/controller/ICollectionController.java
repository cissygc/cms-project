package com.example.controller;

import com.example.dto.collection.CollectionRequestDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Listeleme: herhangi bir giriş yapmış kullanıcı (post oluştururken seçim yapabilsin).
// Oluşturma/silme: sadece ADMIN (service katmanında kontrol ediliyor).
@Tag(name = "Collections", description = "Yazı koleksiyonları/kategorileri - JWT gerekli")
@RequestMapping("/api/collections")
public interface ICollectionController {

    @GetMapping
    ResponseEntity<?> getAllCollections();

    @PostMapping
    ResponseEntity<?> createCollection(@Valid @RequestBody CollectionRequestDto dto, @Parameter(hidden = true) Authentication authentication);

    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteCollection(@PathVariable Long id, @Parameter(hidden = true) Authentication authentication);
}