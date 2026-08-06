package com.example.dto.user;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Kullanıcının kendi profilini düzenlerken gönderdiği alanlar.
// Hepsi opsiyonel - editör istediği alanı güncelleyebilir, göndermediği
// alan mevcut değerinde kalır (bkz. UserServiceImpl.updateMyProfile).
@Data
public class UpdateProfileRequestDto {

    @Size(max = 100, message = "İsim en fazla 100 karakter olabilir")
    private String fullName;

    @Size(max = 2000, message = "Bio en fazla 2000 karakter olabilir")
    private String bio;

    // Opsiyonel - profil fotoğrafı olarak kullanılacak medyanın id'si (Media kütüphanesinden seçilir)
    // NOT: gönderilmezse (null) mevcut avatar KORUNUR - avatarı bilerek kaldırmak
    // için removeAvatar=true göndermek gerekir (bkz. removeAvatar alanı).
    private Long avatarMediaId;

    // true gönderilirse profil fotoğrafı bilerek kaldırılır. avatarMediaId de
    // doluysa avatarMediaId öncelikli sayılır.
    private boolean removeAvatar = false;

    @Size(min = 3, max = 60, message = "Slug 3 ile 60 karakter arasında olmalıdır")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir, örn: ceren-gurcan")
    private String slug;

    // Opsiyonel - kullanıcı adını değiştirmek isterse. NOT: değiştirilirse mevcut
    // JWT token eski kullanıcı adını taşımaya devam eder, kullanıcının yeniden
    // giriş yapması gerekir (bkz. UserServiceImpl.updateMyProfile).
    @Size(min = 3, max = 20, message = "Kullanıcı adı 3 ile 20 karakter arasında olmalıdır")
    @Pattern(regexp = "^[a-zA-Z0-9_.]+$", message = "Kullanıcı adı sadece harf, rakam, alt çizgi ve nokta içerebilir")
    private String username;

    // Şifre değiştirmek istiyorsa YENİ şifre buraya
    @Size(min = 4, max = 40, message = "Şifre en az 4 karakter olmalıdır")
    private String newPassword;

    // newPassword gönderildiyse bu alan da ZORUNLU - kimlik doğrulama için
    // mevcut şifresini bilmesi gerekiyor (açık kalmış bir oturumdan şifre
    // değiştirilmesini engellemek için).
    private String currentPassword;
}