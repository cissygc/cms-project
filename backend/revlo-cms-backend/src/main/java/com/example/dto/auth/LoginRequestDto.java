package com.example.dto.auth;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDto {

    @NotBlank(message = "Kullanıcı adı boş bırakılamaz")
    private String username;

    @NotBlank(message = "Şifre boş bırakılamaz")
    private String password;
}