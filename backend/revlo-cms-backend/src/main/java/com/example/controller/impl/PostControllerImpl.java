package com.example.controller.impl;

import com.example.controller.IPostController;
import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;
import com.example.service.IPostService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/rest/api/posts")
public class PostControllerImpl implements IPostController {
    @Autowired
    private IPostService postService;

    @Override
    @GetMapping(path = "/list")
    public List<PostResponseDto> getAllPosts() {
        return postService.getAllPosts();
    }

    @Override
    @PostMapping(path="/create-post")
    public PostResponseDto createPost(@Valid @RequestBody PostRequestDto postRequestDto) {
        return postService.createPost(postRequestDto);
    }

    @Override
    @GetMapping(path = "/id/{id}")
    public PostResponseDto getPostById(@PathVariable(name = "id") Long id) {
        return postService.getPostById(id);
    }

    // Decap CMS bu 3 endpoint'i slug uzerinden kullaniyor (bkz. custom-backend.js)
    @Override
    @GetMapping(path = "/slug/{slug}")
    public PostResponseDto getPostBySlug(@PathVariable(name = "slug") String slug) {
        return postService.getPostBySlug(slug);
    }

    @Override
    @PutMapping(path = "/slug/{slug}")
    public PostResponseDto updatePostBySlug(@PathVariable(name = "slug") String slug, @Valid @RequestBody PostRequestDto postRequestDto) {
        return postService.updatePostBySlug(slug, postRequestDto);
    }

    @Override
    @DeleteMapping(path = "/slug/{slug}")
    public void deletePostBySlug(@PathVariable(name = "slug") String slug) {
        postService.deletePostBySlug(slug);
    }
}