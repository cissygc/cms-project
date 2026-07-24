package com.example.dto; // Kendi paketine göre ayarla

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequestDto {

    private String slug;

    @NotBlank(message = "Title cannot be blank")
    @Size(min = 2, message = "Title must be at least 2 characters long")
    private String title;

    @NotBlank(message = "Body content cannot be blank")
    private String body;

    @NotBlank(message = "Author cannot be blank")
    private String author;
}