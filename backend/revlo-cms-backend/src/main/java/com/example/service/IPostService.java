package com.example.service;

import com.example.dto.post.PostRequestDto;
import com.example.dto.post.PostResponseDto;

import java.util.List;

public interface IPostService {
    PostResponseDto createPost(PostRequestDto postRequestDto, String username);
    PostResponseDto updatePost(String slug, PostRequestDto postRequestDto, String username, boolean isAdmin);
    PostResponseDto getPostBySlug(String slug, String username, boolean isAdmin);
    List<PostResponseDto> getAllPosts(String username, boolean isAdmin);
    void deletePost(String slug, String username, boolean isAdmin);

    // Bunlar CMS paneli için DEĞİL - CMS'i kullanacak kişinin kendi
    // sitesinin (frontend) postları göstermek için çağıracağı, giriş
    // gerektirmeyen herkese açık metodlar.
    // language / collectionSlug null bırakılırsa o kritere göre filtre uygulanmaz.
    List<PostResponseDto> getAllPublicPosts(String language, String collectionSlug);
    PostResponseDto getPublicPostBySlug(String slug);
}