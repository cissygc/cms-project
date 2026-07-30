package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PostRequestDto {

    @NotBlank(message = "Slug (URL uzantısı) boş bırakılamaz")
    private String slug;

    @NotBlank(message = "Başlık boş bırakılamaz")
    private String title;

    // Opsiyonel medya alanı
    private String image;

    @NotBlank(message = "İçerik boş bırakılamaz")
    private String content;

    // Opsiyonel - gönderilmezse yeni yazılarda DRAFT varsayılır (bkz. PostServiceImpl)
    private String status;
}