package com.example.repository;

import com.example.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<Tag, Long> {
    // "AI" ile "ai" aynı tag sayılsın diye case-insensitive arama - find-or-create
    // mantığında aynı ismin farklı yazımlarla çoğalmasını önlemek için (bkz. PostServiceImpl.resolveTags)
    Optional<Tag> findByNameIgnoreCase(String name);
    boolean existsBySlug(String slug);
}