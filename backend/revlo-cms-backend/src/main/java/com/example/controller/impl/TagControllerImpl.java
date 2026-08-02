package com.example.controller.impl;

import com.example.controller.ITagController;
import com.example.dto.tag.TagDeleteResultDto;
import com.example.dto.tag.TagResponseDto;
import com.example.service.ITagService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class TagControllerImpl implements ITagController {

    private final ITagService tagService;

    public TagControllerImpl(ITagService tagService) {
        this.tagService = tagService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN"));
    }

    @Override
    public ResponseEntity<?> getAllTags() {
        List<TagResponseDto> tags = tagService.getAllTags();
        return ResponseEntity.ok(tags);
    }

    @Override
    public ResponseEntity<?> deleteTag(Long id, boolean confirm, Authentication authentication) {
        TagDeleteResultDto result = tagService.deleteTag(id, isAdmin(authentication), confirm);
        return ResponseEntity.ok(result);
    }
}