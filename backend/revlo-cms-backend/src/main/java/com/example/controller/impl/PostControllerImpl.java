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
    @GetMapping(path = "/{id}")
    public PostResponseDto getPostById(@PathVariable(name = "id") Long id) {
        return postService.getPostById(id);
    }


}
