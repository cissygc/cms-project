package com.example.controller;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;

import java.util.List;

public interface IPostController {
    public List<PostResponseDto> getAllPosts();
    public PostResponseDto createPost(PostRequestDto postRequestDto);
}
