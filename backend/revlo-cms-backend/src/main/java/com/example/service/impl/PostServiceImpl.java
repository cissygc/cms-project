package com.example.service.impl;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;
import com.example.entity.Post;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.mapper.PostMapper;
import com.example.repository.PostRepository;
import com.example.service.IPostService;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

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
        if (postRequestDto.getSlug() == null || postRequestDto.getSlug().isBlank()) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "slug is required"));
        }
        if (postRepository.existsBySlug(postRequestDto.getSlug())) {
            // Decap CMS retry/save durumlarinda ayni slug tekrar gelebilir; kayitli olani dondurup
            // "duplicate key" patlamasini ve olasi sonsuz dongu davranisini onluyoruz.
            Post existing = postRepository.findBySlug(postRequestDto.getSlug()).get();
            PostResponseDto responseDto = new PostResponseDto();
            BeanUtils.copyProperties(existing, responseDto);
            return responseDto;
        }
        Post post=new Post();
        BeanUtils.copyProperties(postRequestDto,post);
        Post savedPost = postRepository.save(post);
        PostResponseDto responseDto = new PostResponseDto();
        BeanUtils.copyProperties(savedPost,responseDto);
        return responseDto;
    }

    @Override
    public PostResponseDto getPostById(Long id) {
        Post post = new Post();
        PostResponseDto responseDto = new PostResponseDto();
        Optional<Post> optionalPost = postRepository.findById(id);
        if (optionalPost.isEmpty()){
            throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "ID: " + id));
        }
        post = optionalPost.get();
        BeanUtils.copyProperties(post,responseDto);
        return responseDto;
    }

    @Override
    public PostResponseDto getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "slug: " + slug)));
        PostResponseDto responseDto = new PostResponseDto();
        BeanUtils.copyProperties(post, responseDto);
        return responseDto;
    }

    @Override
    public PostResponseDto updatePostBySlug(String slug, PostRequestDto postRequestDto) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "slug: " + slug)));
        post.setTitle(postRequestDto.getTitle());
        post.setBody(postRequestDto.getBody());
        post.setAuthor(postRequestDto.getAuthor());
        // slug kasitli olarak degistirilmiyor: Decap'in URL'i / kimligi hep ayni kalmali.
        Post savedPost = postRepository.save(post);
        PostResponseDto responseDto = new PostResponseDto();
        BeanUtils.copyProperties(savedPost, responseDto);
        return responseDto;
    }

    @Override
    public void deletePostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "slug: " + slug)));
        postRepository.delete(post);
    }

}