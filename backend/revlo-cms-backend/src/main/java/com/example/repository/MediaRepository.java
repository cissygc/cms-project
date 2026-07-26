package com.example.repository;

import com.example.entity.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {
    // Sadece belirli bir kullanıcıya ait medyaları getiren metot
    List<Media> findAllByUserId(Long userId);

    // Dashboard istatistikleri ve kullanıcı silme kontrolü için
    long countByUserId(Long userId);
}