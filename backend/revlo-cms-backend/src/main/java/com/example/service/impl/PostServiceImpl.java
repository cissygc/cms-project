package com.example.service.impl;

import com.example.dto.post.PostRequestDto;
import com.example.dto.post.PostResponseDto;
import com.example.dto.collection.CollectionSummaryDto;
import com.example.entity.Collection;
import com.example.entity.Language;
import com.example.entity.Post;
import com.example.entity.PostStatus;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.CollectionRepository;
import com.example.repository.PostRepository;
import com.example.repository.UserRepository;
import com.example.service.IPostService;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PostServiceImpl implements IPostService {

    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final CollectionRepository collectionRepository;

    public PostServiceImpl(PostRepository postRepository, UserRepository userRepository, CollectionRepository collectionRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.collectionRepository = collectionRepository;
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
        post.setLanguage(parseLanguage(postRequestDto.getLanguage(), Language.TR));
        post.setCollections(resolveCollections(postRequestDto.getCollectionIds()));

        Post savedPost = postRepository.save(post);
        return mapToDto(savedPost);
    }

    // İstekten gelen dil metnini güvenli şekilde enum'a çevirir; boş/geçersizse
    // verilen varsayılana düşer.
    private Language parseLanguage(String rawLanguage, Language fallback) {
        if (rawLanguage == null || rawLanguage.isBlank()) {
            return fallback;
        }
        try {
            return Language.valueOf(rawLanguage.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                    "Geçersiz dil: " + rawLanguage + " (izin verilenler: TR, EN, DE, RU)"));
        }
    }

    // Verilen id listesindeki koleksiyonları getirir; içlerinden biri bile
    // bulunamazsa hata fırlatır (post'un sessizce yanlış/eksik koleksiyona
    // atanmasını önlemek için).
    private Set<Collection> resolveCollections(List<Long> collectionIds) {
        if (collectionIds == null || collectionIds.isEmpty()) {
            return new HashSet<>();
        }
        List<Collection> found = collectionRepository.findAllByIdIn(collectionIds);
        if (found.size() != new HashSet<>(collectionIds).size()) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Belirtilen koleksiyonlardan biri veya birkaçı bulunamadı"));
        }
        return new HashSet<>(found);
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
        post.setLanguage(parseLanguage(postRequestDto.getLanguage(), post.getLanguage()));
        // NOT: collectionIds hiç gönderilmezse (null) mevcut atamalar korunur;
        // boş liste [] gönderilirse post bilerek tüm koleksiyonlardan çıkarılmış olur.
        if (postRequestDto.getCollectionIds() != null) {
            post.setCollections(resolveCollections(postRequestDto.getCollectionIds()));
        }

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
    public List<PostResponseDto> getAllPublicPosts(String language, String collectionSlug) {
        Language languageFilter = null;
        if (language != null && !language.isBlank()) {
            try {
                languageFilter = Language.valueOf(language.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                        "Geçersiz dil: " + language + " (izin verilenler: TR, EN, DE, RU)"));
            }
        }

        final Language finalLanguageFilter = languageFilter;

        // Sadece yayınlanmış yazılar public API'de görünür - draft'lar burada listelenmez.
        return postRepository.findAll().stream()
                .filter(post -> post.getStatus() == PostStatus.PUBLISHED)
                .filter(post -> finalLanguageFilter == null || post.getLanguage() == finalLanguageFilter)
                .filter(post -> collectionSlug == null || collectionSlug.isBlank()
                        || post.getCollections().stream().anyMatch(c -> c.getSlug().equals(collectionSlug)))
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
        List<CollectionSummaryDto> collectionDtos = post.getCollections().stream()
                .map(c -> new CollectionSummaryDto(c.getId(), c.getName(), c.getSlug()))
                .collect(Collectors.toList());

        return new PostResponseDto(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                post.getImage(),
                post.getContent(),
                post.getStatus().name(),
                post.getLanguage().name(),
                collectionDtos,
                post.getAuthor().getUsername(), // Yazarın sadece adını dönüyoruz
                post.getAuthor().getFullName(),
                post.getAuthor().getAvatarUrl(),
                post.getAuthor().getSlug(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }
}