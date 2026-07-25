package com.example.controller.impl;

import com.example.controller.IAuthController;
import com.example.dto.auth.JwtResponseDto;
import com.example.dto.auth.LoginRequestDto;
import com.example.dto.auth.RegisterRequestDto;
import com.example.dto.auth.RegisterResponseDto;
import com.example.service.IAuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthControllerImpl implements IAuthController {

    private final IAuthService authService;

    public AuthControllerImpl(IAuthService authService) {
        this.authService = authService;
    }

    @Override
    public ResponseEntity<?> authenticateUser(LoginRequestDto loginRequestDto) {
        JwtResponseDto jwtResponse = authService.authenticateUser(loginRequestDto);
        return ResponseEntity.ok(jwtResponse);
    }

    @Override
    public ResponseEntity<?> registerUser(RegisterRequestDto registerRequestDto) {
        RegisterResponseDto registerResponse = authService.registerUser(registerRequestDto);
        return ResponseEntity.ok(registerResponse);
    }
}