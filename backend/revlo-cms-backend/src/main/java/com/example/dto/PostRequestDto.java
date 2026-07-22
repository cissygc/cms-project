package com.example.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequestDto {

    @NotBlank(message = "Başlık alanı boş bırakılamaz!")
    @Size(min = 2, message = "Başlık en az 2 karakter olmalıdır.")
    private String title;

    @NotBlank(message = "İçerik k boş bırakılamaz!")
    private String body;

    @NotBlank(message = "")
    private String author;
}