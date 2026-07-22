package com.example.service.impl;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;
import com.example.entity.Post;
import com.example.mapper.PostMapper;
import com.example.repository.PostRepository;
import com.example.service.IPostService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class PostServiceImpl implements IPostService {
    @Autowired
    private PostRepository postRepository;

    @Autowired
    private PostMapper postMapper;

    @Override
    public List<PostResponseDto> getAllPosts() {
        List<PostResponseDto> response = new ArrayList<>();
        List<Post> posts = postRepository.findAll();
        for(Post post:posts){
            PostResponseDto dto = new PostResponseDto();
            BeanUtils.copyProperties(post,dto);
            response.add(dto);
        }
        return response;
    }

    @Override
    public PostResponseDto createPost(PostRequestDto postRequestDto) {
        Post post=new Post();
        BeanUtils.copyProperties(postRequestDto,post);
        Post savedPost = postRepository.save(post);
        PostResponseDto responseDto = new PostResponseDto();
        BeanUtils.copyProperties(savedPost,responseDto);
        return responseDto;
    }
}
