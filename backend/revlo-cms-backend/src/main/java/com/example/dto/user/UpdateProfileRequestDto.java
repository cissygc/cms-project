package com.example.dto.user;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateProfileRequestDto {

    @Size(max = 100, message = "İsim en fazla 100 karakter olabilir")
    private String fullName;

    @Size(max = 2000, message = "Bio en fazla 2000 karakter olabilir")
    private String bio;

    @Size(max = 500, message = "Avatar URL çok uzun")
    private String avatarUrl;

    @Size(min = 3, max = 60, message = "Slug 3 ile 60 karakter arasında olmalıdır")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir, örn: ali-demir")
    private String slug;
}