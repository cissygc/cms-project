package com.example.dto.collection;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollectionResponseDto {
    private Long id;
    private String name;
    private String slug;
    private long postCount;
}