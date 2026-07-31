package com.example.repository;

import com.example.entity.Collection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CollectionRepository extends JpaRepository<Collection, Long> {
    Optional<Collection> findBySlug(String slug);
    boolean existsBySlug(String slug);
    boolean existsByName(String name);
    List<Collection> findAllByIdIn(List<Long> ids);
}