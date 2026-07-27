package com.example.controller;

import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Tag(name = "Dashboard", description = "Özet istatistikler - JWT gerekli")
@RequestMapping("/api/dashboard")
public interface IDashboardController {

    // ADMIN: sistemin geneli. EDITOR: sadece kendi yazı/medyaları.
    @GetMapping("/stats")
    ResponseEntity<?> getStats(@Parameter(hidden = true) Authentication authentication);
}
