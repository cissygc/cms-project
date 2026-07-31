package com.example.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequestDto {

    @NotBlank(message = "Kullanıcı adı boş bırakılamaz")
    @Size(min = 3, max = 20, message = "Kullanıcı adı 3 ile 20 karakter arasında olmalıdır")
    private String username;

    @NotBlank(message = "Şifre boş bırakılamaz")
    @Size(min = 4, max = 40, message = "Şifre en az 4 karakter olmalıdır")
    private String password;

    // Rolü dışarıdan alacağız. Eğer gönderilmezse backend'de varsayılan olarak "EDITOR" atayabiliriz.
    private String role;
}