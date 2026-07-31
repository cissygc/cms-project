package com.example.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class PostResponseDto {
    private Long id;
    private String slug;
    private String title;
    private String image;
    private String content;
    private String authorName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}