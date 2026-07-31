package com.example.repository;

import com.example.entity.PostMedia;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostMediaRepository extends JpaRepository<PostMedia, Long> {
    // Bir medya dosyası herhangi bir post'un içeriğinde kullanılıyor mu -
    // MediaServiceImpl.deleteMedia buna bakarak kullanılan bir dosyanın
    // silinmesini engelliyor.
    boolean existsByMedia_Id(Long mediaId);
}