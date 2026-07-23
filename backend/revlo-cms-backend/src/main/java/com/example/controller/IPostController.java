package com.example.controller;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;

import java.util.List;

public interface IPostController {
    public List<PostResponseDto> getAllPosts();
    public PostResponseDto createPost(PostRequestDto postRequestDto);
    public PostResponseDto getPostById(Long id);
    public PostResponseDto getPostBySlug(String slug);
    public PostResponseDto updatePostBySlug(String slug, PostRequestDto postRequestDto);
    public void deletePostBySlug(String slug);
}