package com.example.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Bu controller CMS paneli için DEĞİL. CMS'i kullanacak kişinin kendi
 * sitesinin (frontend) postları çekip göstermesi için var - giriş
 * yapmadan (JWT olmadan) herkes çağırabilir.
 */
@RequestMapping("/api/public/posts")
public interface IPublicPostController {

    // Tüm postları listeler (public blog anasayfası için)
    @GetMapping
    ResponseEntity<?> getAllPublicPosts();

    // Slug ile tek bir postun detayını getirir (public blog yazı sayfası için)
    @GetMapping("/{slug}")
    ResponseEntity<?> getPublicPostBySlug(@PathVariable String slug);
}