package com.example.dto.post;

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
    private String language;
    private java.util.List<com.example.dto.collection.CollectionSummaryDto> collections;
    private String authorName;
    private String authorFullName;
    private String authorAvatarUrl;
    private String authorSlug;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}