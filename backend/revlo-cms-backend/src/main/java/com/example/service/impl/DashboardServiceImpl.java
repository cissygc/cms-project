package com.example.service.impl;

import com.example.dto.post.PostResponseDto;
import com.example.dto.collection.CollectionSummaryDto;
import com.example.dto.dashboard.DashboardStatsDto;
import com.example.entity.Media;
import com.example.entity.Post;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.MediaRepository;
import com.example.repository.PostRepository;
import com.example.repository.UserRepository;
import com.example.service.IDashboardService;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardServiceImpl implements IDashboardService {

    private final PostRepository postRepository;
    private final MediaRepository mediaRepository;
    private final UserRepository userRepository;

    public DashboardServiceImpl(PostRepository postRepository, MediaRepository mediaRepository, UserRepository userRepository) {
        this.postRepository = postRepository;
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DashboardStatsDto getStats(String username, boolean isAdmin) {
        if (isAdmin) {
            long totalPosts = postRepository.count();
            long totalMedia = mediaRepository.count();
            long totalUsers = userRepository.count();
            List<PostResponseDto> recentPosts = postRepository.findTop5ByOrderByCreatedAtDesc().stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            return new DashboardStatsDto(totalPosts, totalMedia, totalUsers, recentPosts);
        } else {
            User user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı")));

            long totalPosts = postRepository.countByAuthor_Id(user.getId());
            long totalMedia = mediaRepository.countByUserId(user.getId());
            List<PostResponseDto> recentPosts = postRepository.findTop5ByAuthor_UsernameOrderByCreatedAtDesc(username).stream()
                    .map(this::mapToDto)
                    .collect(Collectors.toList());

            // Editör kendi dışındaki toplam kullanıcı sayısını görmemeli
            return new DashboardStatsDto(totalPosts, totalMedia, 0, recentPosts);
        }
    }

    private PostResponseDto mapToDto(Post post) {
        List<CollectionSummaryDto> collectionDtos = post.getCollections().stream()
                .map(c -> new CollectionSummaryDto(c.getId(), c.getName(), c.getSlug()))
                .collect(Collectors.toList());

        return new PostResponseDto(
                post.getId(),
                post.getSlug(),
                post.getTitle(),
                resolveMediaUrl(post.getCoverMedia()),
                post.getContent(),
                post.getStatus().name(),
                post.getLanguage().name(),
                collectionDtos,
                java.util.Collections.emptyList(),
                // Dashboard "son eklenen yazılar" özeti için içerik görselleri
                // taşınmıyor (hafif tutmak için) - sadece kapak görseli yeterli.
                java.util.Collections.emptyList(),
                // Dashboard özeti için SEO/okuma süresi hesaplanmıyor (hafif tutmak için,
                // media listesiyle aynı deliberate simplification) - CMS panelinde ilgili
                // post açıldığında zaten tam veriyle (PostServiceImpl.mapToDto) gelecek.
                null,
                0,
                post.getPublishAt(),
                post.getAuthor().getUsername(),
                post.getAuthor().getFullName(),
                resolveMediaUrl(post.getAuthor().getAvatarMedia()),
                post.getAuthor().getSlug(),
                post.getCreatedAt(),
                post.getUpdatedAt()
        );
    }

    // PostServiceImpl'deki resolveMediaUrl/toAbsoluteUrl ile aynı mantık - iki
    // servis birbirine bağımlı olmasın diye burada da küçük bir tekrar var.
    private String resolveMediaUrl(Media media) {
        if (media == null) {
            return null;
        }
        if (media.getFileUrl() != null && media.getFileUrl().startsWith("http")) {
            return media.getFileUrl();
        }
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return baseUrl + media.getFileUrl();
    }
}