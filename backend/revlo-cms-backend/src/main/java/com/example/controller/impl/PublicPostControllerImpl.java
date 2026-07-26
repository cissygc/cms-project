package com.example.controller.impl;

import com.example.controller.IPublicPostController;
import com.example.dto.PostResponseDto;
import com.example.service.IPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class PublicPostControllerImpl implements IPublicPostController {

    private final IPostService postService;

    public PublicPostControllerImpl(IPostService postService) {
        this.postService = postService;
    }

    @Override
    public ResponseEntity<?> getAllPublicPosts() {
        List<PostResponseDto> posts = postService.getAllPublicPosts();
        return ResponseEntity.ok(posts);
    }

    @Override
    public ResponseEntity<?> getPublicPostBySlug(String slug) {
        PostResponseDto post = postService.getPublicPostBySlug(slug);
        return ResponseEntity.ok(post);
    }
}