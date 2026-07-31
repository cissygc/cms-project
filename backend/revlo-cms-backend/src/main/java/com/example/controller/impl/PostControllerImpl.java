package com.example.controller.impl;

import com.example.controller.IPostController;
import com.example.dto.post.PostRequestDto;
import com.example.dto.post.PostResponseDto;
import com.example.service.IPostService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class PostControllerImpl implements IPostController {

    private final IPostService postService;

    public PostControllerImpl(IPostService postService) {
        this.postService = postService;
    }

    // Kullanıcının ADMIN yetkisine sahip olup olmadığını kontrol eden yardımcı metot
    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN"));
    }

    @Override
    public ResponseEntity<?> getAllPosts(Authentication authentication) {
        String username = authentication.getName();
        List<PostResponseDto> posts = postService.getAllPosts(username, isAdmin(authentication));
        return ResponseEntity.ok(posts);
    }

    @Override
    public ResponseEntity<?> getPostBySlug(String slug, Authentication authentication) {
        String username = authentication.getName();
        PostResponseDto post = postService.getPostBySlug(slug, username, isAdmin(authentication));
        return ResponseEntity.ok(post);
    }

    @Override
    public ResponseEntity<?> createPost(PostRequestDto postRequestDto, Authentication authentication) {
        // İsteği atan giriş yapmış kullanıcının adını alıyoruz
        String username = authentication.getName();

        PostResponseDto createdPost = postService.createPost(postRequestDto, username);
        return ResponseEntity.ok(createdPost);
    }

    @Override
    public ResponseEntity<?> updatePost(String slug, PostRequestDto postRequestDto, Authentication authentication) {
        String username = authentication.getName();

        PostResponseDto updatedPost = postService.updatePost(slug, postRequestDto, username, isAdmin(authentication));
        return ResponseEntity.ok(updatedPost);
    }

    @Override
    public ResponseEntity<?> deletePost(String slug, Authentication authentication) {
        String username = authentication.getName();

        postService.deletePost(slug, username, isAdmin(authentication));
        return ResponseEntity.ok(Map.of("message", "Yazı başarıyla silindi."));
    }
}