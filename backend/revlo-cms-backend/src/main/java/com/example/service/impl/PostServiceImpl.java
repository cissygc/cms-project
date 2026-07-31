package com.example.service.impl;

import com.example.dto.PostRequestDto;
import com.example.dto.PostResponseDto;
import com.example.entity.Post;
import com.example.entity.PostStatus;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.PostRepository;
import com.example.repository.UserRepository;
import com.example.service.IPostService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements IPostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;

    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    @Override
    public PostResponseDto createPost(PostRequestDto postRequestDto, String username) {
        if (postRepository.existsBySlug(postRequestDto.getSlug())) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu slug (URL) zaten kullanımda"));
        }

        User author = userRepository.findByUsername(username)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazar bulunamadı")));

        Post post = new Post();
        post.setSlug(postRequestDto.getSlug());
        post.setTitle(postRequestDto.getTitle());
        post.setContent(postRequestDto.getContent());
        post.setImage(postRequestDto.getImage());
        post.setAuthor(author);
        // Yeni yazılar için varsayılan DRAFT - editör bilerek yayınlamadıkça
        // yazı public API'de görünmesin.
        post.setStatus(parseStatus(postRequestDto.getStatus(), PostStatus.DRAFT));

        Post savedPost = postRepository.save(post);
        return mapToDto(savedPost);
    }

    // İstekten gelen status metnini güvenli şekilde enum'a çevirir; boş/geçersizse
    // verilen varsayılana düşer (yazı oluşturma sırasında hata fırlatıp editörü
    // takılı bırakmamak için).
    private PostStatus parseStatus(String rawStatus, PostStatus fallback) {
        if (rawStatus == null || rawStatus.isBlank()) {
            return fallback;
        }
        try {
            return PostStatus.valueOf(rawStatus.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            return fallback;
        }
    }

    @Override
    public PostResponseDto updatePost(String slug, PostRequestDto postRequestDto, String username, boolean isAdmin) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        // EDITOR sadece kendi yazısını güncelleyebilir; ADMIN hepsini güncelleyebilir
        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu yazıyı düzenleme yetkiniz yok"));
        }

        // Eğer kullanıcı slug'ı da değiştirdiyse ve yeni slug başkasına aitse hata fırlat
        if (!post.getSlug().equals(postRequestDto.getSlug()) && postRepository.existsBySlug(postRequestDto.getSlug())) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Yeni slug zaten kullanımda"));
        }

        post.setSlug(postRequestDto.getSlug());
        post.setTitle(postRequestDto.getTitle());
        post.setContent(postRequestDto.getContent());
        post.setImage(postRequestDto.getImage());
        post.setStatus(parseStatus(postRequestDto.getStatus(), post.getStatus()));

        Post updatedPost = postRepository.save(post);
        return mapToDto(updatedPost);
    }

    @Override
    public PostResponseDto getPostBySlug(String slug, String username, boolean isAdmin) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu yazıyı görüntüleme yetkiniz yok"));
        }

        return mapToDto(post);
    }

    @Override
    public List<PostResponseDto> getAllPosts(String username, boolean isAdmin) {
        List<Post> posts = isAdmin
                ? postRepository.findAll()
                : postRepository.findAllByAuthor_Username(username);

        return posts.stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deletePost(String slug, String username, boolean isAdmin) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        if (!isAdmin && !post.getAuthor().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu yazıyı silme yetkiniz yok"));
        }

        postRepository.delete(post);
    }

    // ---------- CMS dışındaki (herkese açık) siteler için ----------

    @Override
    public List<PostResponseDto> getAllPublicPosts() {
        // Sadece yayınlanmış yazılar public API'de görünür - draft'lar burada listelenmez.
        return postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.PUBLISHED)
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public PostResponseDto getPublicPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı")));

        // Draft bir yazının linkini bilen biri direkt slug ile de erişemesin.
        if (post.getStatus() != PostStatus.PUBLISHED) {
            throw new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Yazı bulunamadı"));
        }

        return mapToDto(post);
    }

    // Entity -> DTO Dönüşümünü yapan yardımcı metot (Boilerplate kodu engeller)
    private PostResponseDto mapToDto(Post post) {
        return new PostResponseDto(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                post.getImage(),
                post.getContent(),
                post.getStatus().name(),
                post.getAuthor().getUsername(), // Yazarın sadece adını dönüyoruz
                post.getAuthor().getFullName(),
                post.getAuthor().getAvatarUrl(),
                post.getAuthor().getSlug(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}