package com.example.dto.post;

import com.example.dto.collection.CollectionSummaryDto;
import com.example.dto.postMedia.PostMediaResponseDto;
import com.example.dto.postSeo.PostSeoResponseDto;
import com.example.dto.tag.TagSummaryDto;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<CollectionSummaryDto> collections;
    private List<TagSummaryDto> tags;
    private List<PostMediaResponseDto> media;
    private PostSeoResponseDto seo;
    // İçerik kelime sayısından otomatik hesaplanır - editör hiçbir şey girmez (bkz. PostServiceImpl.calculateReadingTime)
    private int readingTimeMinutes;
    // Zamanlanmış yayın tarihi (bkz. PostPublishScheduler) - null ise zamanlama yok
    private LocalDateTime publishAt;
    private String authorName;
    private String authorFullName;
    private String authorAvatarUrl;
    private String authorSlug;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}