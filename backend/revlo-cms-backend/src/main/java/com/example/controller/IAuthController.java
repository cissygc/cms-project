package com.example.controller;

import com.example.dto.auth.LoginRequestDto;
import com.example.dto.auth.RegisterRequestDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/api/auth")
public interface IAuthController {

    @PostMapping("/signin")
    ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequestDto loginRequestDto);

    @PostMapping("/signup")
    ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequestDto registerRequestDto);
}