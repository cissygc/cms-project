package com.example.dto.postMedia;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostMediaResponseDto {
    private Long mediaId;
    private String url;
    private String caption;
    private int sortOrder;
}