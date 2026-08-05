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

    // ----- Profil alanları - admin editörü oluştururken bunları da girsin -----
    @NotBlank(message = "İsim boş bırakılamaz")
    @Size(min = 2, max = 100, message = "İsim 2 ile 100 karakter arasında olmalıdır")
    private String fullName;

    @Size(max = 2000, message = "Bio en fazla 2000 karakter olabilir")
    private String bio;

    // Opsiyonel - profil fotoğrafı olarak kullanılacak medyanın id'si (Media kütüphanesinden seçilir)
    private Long avatarMediaId;

    // Opsiyonel - boş bırakılırsa kullanıcı adından otomatik üretilir (bkz. AuthServiceImpl)
    @Size(min = 3, max = 60, message = "Slug 3 ile 60 karakter arasında olmalıdır")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir, örn: ceren-gurcan")
    private String slug;
}