package com.example.service;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;

import java.util.List;

public interface IPostService {
    public List<PostResponseDto> getAllPosts();
    public PostResponseDto createPost(PostRequestDto postRequestDto);
    public PostResponseDto getPostById(Long id);
}
