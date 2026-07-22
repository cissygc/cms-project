package com.example.mapper;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;
import com.example.entity.Post;
import org.springframework.stereotype.Component;

@Component
public class PostMapper {


    public PostResponseDto toResponseDTO(Post post) {
        if (post == null) return null;

        PostResponseDto dto = new PostResponseDto();
        dto.setId(post.getId());
        dto.setTitle(post.getTitle());
        dto.setBody(post.getBody());
        dto.setAuthor(post.getAuthor());
        dto.setCreatedAt(post.getCreatedAt());

        return dto;
    }


    public Post toEntity(PostRequestDto dto) {
        if (dto == null) return null;

        Post post = new Post();
        post.setTitle(dto.getTitle());
        post.setBody(dto.getBody());
        post.setAuthor(dto.getAuthor());

        return post;
    }
}