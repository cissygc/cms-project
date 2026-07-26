package com.example.service;

import com.example.dto.auth.JwtResponseDto;
import com.example.dto.auth.LoginRequestDto;
import com.example.dto.auth.RegisterRequestDto;
import com.example.dto.auth.RegisterResponseDto;

public interface IAuthService {
    JwtResponseDto authenticateUser(LoginRequestDto loginRequestDto);
    RegisterResponseDto registerUser(RegisterRequestDto registerRequestDto);
}