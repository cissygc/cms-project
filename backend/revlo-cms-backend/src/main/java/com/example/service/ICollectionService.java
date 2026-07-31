package com.example.service;

import com.example.dto.collection.CollectionRequestDto;
import com.example.dto.collection.CollectionResponseDto;

import java.util.List;

public interface ICollectionService {
    List<CollectionResponseDto> getAllCollections();
    CollectionResponseDto createCollection(CollectionRequestDto dto, boolean isAdmin);
    void deleteCollection(Long id, boolean isAdmin);
}