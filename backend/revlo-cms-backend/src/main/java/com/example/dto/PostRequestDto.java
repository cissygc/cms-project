package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequestDto {

    @NotBlank(message = "Slug (URL uzantısı) boş bırakılamaz")
    @Size(max = 150, message = "Slug en fazla 150 karakter olabilir")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir, örn: merhaba-dunya")
    private String slug;

    @NotBlank(message = "Başlık boş bırakılamaz")
    @Size(max = 300, message = "Başlık en fazla 300 karakter olabilir")
    private String title;

    // Opsiyonel medya alanı
    private String image;

    @NotBlank(message = "İçerik boş bırakılamaz")
    private String content;

    // Opsiyonel - gönderilmezse yeni yazılarda DRAFT varsayılır (bkz. PostServiceImpl)
    private String status;
}