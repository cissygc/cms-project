package com.example.controller;

import com.example.dto.media.MediaRequestDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Media", description = "Dosya/görsel yükleme ve yönetimi - JWT gerekli")
@RequestMapping("/api/media")
public interface IMediaController {

    // Dosya yükleme (Multipart form data içerir)
    @PostMapping
    ResponseEntity<?> uploadMedia(@Valid @ModelAttribute MediaRequestDto mediaRequestDto, @Parameter(hidden = true) Authentication authentication);

    // Kullanıcının kendi medyalarını listeleme
    @GetMapping
    ResponseEntity<?> getUserMedia(@Parameter(hidden = true) Authentication authentication);

    // Belirli bir medyayı silme
    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteMedia(@PathVariable Long id, @Parameter(hidden = true) Authentication authentication);
}
