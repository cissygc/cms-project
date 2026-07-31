package com.example.dto.collection;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// PostResponseDto içine gömülen hafif versiyon - postCount içermez.
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CollectionSummaryDto {
    private Long id;
    private String name;
    private String slug;
}