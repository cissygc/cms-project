package com.example.controller.impl;

import com.example.controller.ICollectionController;
import com.example.dto.collection.CollectionRequestDto;
import com.example.dto.collection.CollectionResponseDto;
import com.example.service.ICollectionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class CollectionControllerImpl implements ICollectionController {

    private final ICollectionService collectionService;

    public CollectionControllerImpl(ICollectionService collectionService) {
        this.collectionService = collectionService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN"));
    }

    @Override
    public ResponseEntity<?> getAllCollections() {
        List<CollectionResponseDto> collections = collectionService.getAllCollections();
        return ResponseEntity.ok(collections);
    }

    @Override
    public ResponseEntity<?> createCollection(CollectionRequestDto dto, Authentication authentication) {
        CollectionResponseDto created = collectionService.createCollection(dto, isAdmin(authentication));
        return ResponseEntity.ok(created);
    }

    @Override
    public ResponseEntity<?> deleteCollection(Long id, Authentication authentication) {
        collectionService.deleteCollection(id, isAdmin(authentication));
        return ResponseEntity.ok(Map.of("message", "Koleksiyon başarıyla silindi."));
    }
}