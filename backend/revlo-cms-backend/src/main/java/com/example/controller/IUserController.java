package com.example.controller;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

// Bu endpoint'ler SecurityConfig içinde sadece ADMIN rolüne açık.
@Tag(name = "Users", description = "Kullanıcı yönetimi - sadece ADMIN")
@RequestMapping("/api/users")
public interface IUserController {

    // Tüm kullanıcıları (şifre hariç) listeler - Kullanıcı Yönetimi ekranı için
    @GetMapping
    ResponseEntity<?> getAllUsers();

    // Bir kullanıcıyı siler
    @DeleteMapping("/{id}")
    ResponseEntity<?> deleteUser(@PathVariable Long id, @Parameter(hidden = true) Authentication authentication);
}
