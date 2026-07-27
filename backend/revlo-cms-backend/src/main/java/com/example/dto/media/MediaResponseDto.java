package com.example.dto.media;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MediaResponseDto {
    private String id;
    private String name;
    private String url;
    private Long size;
}