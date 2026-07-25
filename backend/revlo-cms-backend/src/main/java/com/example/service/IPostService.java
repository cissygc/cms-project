package com.example.service;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;

import java.util.List;

public interface IPostService {
    PostResponseDto createPost(PostRequestDto postRequestDto, String username);
    PostResponseDto updatePost(String slug, PostRequestDto postRequestDto, String username, boolean isAdmin);
    PostResponseDto getPostBySlug(String slug, String username, boolean isAdmin);
    List<PostResponseDto> getAllPosts(String username, boolean isAdmin);
    void deletePost(String slug, String username, boolean isAdmin);
}