package com.example.controller;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Listeleme: herhangi bir giriş yapmış kullanıcı (post yazarken autocomplete için).
// Silme: sadece ADMIN, iki aşamalı onay akışıyla (bkz. TagServiceImpl).
// NOT: Tag OLUŞTURMA için ayrı bir endpoint YOK - tag'ler post kaydedilirken
// "find or create" mantığıyla otomatik oluşuyor (bkz. PostServiceImpl.resolveTags).
@Tag(name = "Tags", description = "Serbest etiketler - JWT gerekli")
@RequestMapping("/api/tags")
public interface ITagController {

    @GetMapping
    ResponseEntity<?> getAllTags();

    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteTag(@PathVariable Long id,
                                @RequestParam(required = false, defaultValue = "false") boolean confirm,
                                @Parameter(hidden = true) Authentication authentication);
}