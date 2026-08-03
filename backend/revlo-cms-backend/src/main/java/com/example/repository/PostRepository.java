package com.example.repository;

import com.example.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PostRepository extends JpaRepository<Post, Long> {
    Optional<Post> findBySlug(String slug);
    boolean existsBySlug(String slug);
    java.util.List<Post> findAllByAuthor_Username(String username);

    // Dashboard: en son eklenen 5 yazı
    java.util.List<Post> findTop5ByOrderByCreatedAtDesc();
    java.util.List<Post> findTop5ByAuthor_UsernameOrderByCreatedAtDesc(String username);

    // Kullanıcı silme kontrolü için: bu kullanıcının kaç yazısı var
    long countByAuthor_Id(Long userId);

    // Collection silme kontrolü ve listede postCount göstermek için
    long countByCollections_Id(Long collectionId);

    // Bir koleksiyon silinirken, o koleksiyona bağlı post'ları bulup
    // bağlantılarını kaldırmak için (bkz. CollectionServiceImpl.deleteCollection)
    java.util.List<Post> findAllByCollections_Id(Long collectionId);

    // Aynı mantık tag'ler için (bkz. TagServiceImpl.deleteTag)
    java.util.List<Post> findAllByTags_Id(Long tagId);

    // Zamanlanmış yayın için: status DRAFT ve publishAt geçmişte/şimdi olan
    // yazıları bulur (bkz. PostPublishScheduler)
    java.util.List<Post> findAllByStatusAndPublishAtLessThanEqual(com.example.entity.PostStatus status, java.time.LocalDateTime now);

    // Bir medya kapak görseli olarak kullanılıyor mu - MediaServiceImpl.deleteMedia
    // artık bunu da kontrol ediyor (önceden coverMedia bir string olduğu için bu
    // kontrol yapılamıyordu).
    boolean existsByCoverMedia_Id(Long mediaId);
}