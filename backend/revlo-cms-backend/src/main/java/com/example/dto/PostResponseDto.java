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
    private String status;
    private String authorName;
    private String authorFullName;
    private String authorAvatarUrl;
    private String authorSlug;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}