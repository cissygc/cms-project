package com.example.service;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;

import java.util.List;

public interface IPostService {
    public List<PostResponseDto> getAllPosts();
    public PostResponseDto createPost(PostRequestDto postRequestDto);
    public PostResponseDto getPostById(Long id);
    public PostResponseDto getPostBySlug(String slug);
    public PostResponseDto updatePostBySlug(String slug, PostRequestDto postRequestDto);
    public void deletePostBySlug(String slug);
}