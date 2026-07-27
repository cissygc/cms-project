package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/dashboard")
public interface IDashboardController {

    // ADMIN: sistemin geneli. EDITOR: sadece kendi yazı/medyaları.
    @GetMapping("/stats")
    ResponseEntity<?> getStats(Authentication authentication);
}
