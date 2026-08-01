package com.example.controller;

import com.example.dto.user.UpdateProfileRequestDto;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// /api/users/** SecurityConfig içinde ADMIN'e kilitli, TEK istisna /api/users/me
// (kendi profilini görme/düzenleme) - bu ikisi herhangi bir giriş yapmış kullanıcıya açık.
@Tag(name = "Users", description = "Kullanıcı yönetimi (ADMIN) ve kendi profilini yönetme (herkes)")
@RequestMapping("/api/users")
public interface IUserController {

    // Varsayılan olarak silinmiş kullanıcılar listede görünmez.
    // ?includeDeleted=true ile admin panelinde "silinmişleri göster" filtresi açıldığında kullanılır.
    @GetMapping
    ResponseEntity<?> getAllUsers(@RequestParam(required = false, defaultValue = "false") boolean includeDeleted);

    // Bir kullanıcıyı siler
    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteUser(@PathVariable Long id, @Parameter(hidden = true) Authentication authentication);

    // Giriş yapmış kullanıcının kendi profilini getirir (ADMIN veya EDITOR fark etmez)
    @GetMapping("/me")
    ResponseEntity<?> getMyProfile(@Parameter(hidden = true) Authentication authentication);

    // Giriş yapmış kullanıcının kendi profilini günceller (fullName, bio, avatarUrl, slug)
    @PutMapping("/me")
    ResponseEntity<?> updateMyProfile(@Valid @RequestBody UpdateProfileRequestDto dto, @Parameter(hidden = true) Authentication authentication);
}