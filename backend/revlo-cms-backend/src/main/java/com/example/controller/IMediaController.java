package com.example.controller;

import com.example.dto.media.MediaRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RequestMapping("/api/media")
public interface IMediaController {

    // Dosya yükleme (Multipart form data içerir)
    @PostMapping
    ResponseEntity<?> uploadMedia(@Valid @ModelAttribute MediaRequestDto mediaRequestDto, Authentication authentication);

    // Kullanıcının kendi medyalarını listeleme
    @GetMapping
    ResponseEntity<?> getUserMedia(Authentication authentication);

    // Belirli bir medyayı silme
    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteMedia(@PathVariable Long id, Authentication authentication);
}