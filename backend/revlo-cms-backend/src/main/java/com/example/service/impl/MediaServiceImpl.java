package com.example.service.impl;

import com.example.dto.media.MediaRequestDto;
import com.example.dto.media.MediaResponseDto;
import com.example.entity.Media;
import com.example.entity.User;
import com.example.repository.MediaRepository;
import com.example.repository.UserRepository;
import com.example.service.IMediaService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MediaServiceImpl implements IMediaService {

    private final MediaRepository mediaRepository;
    private final UserRepository userRepository;

    // Dosyaların fiziksel olarak kaydedileceği klasör
    private final String uploadDir = "uploads/";

    public MediaServiceImpl(MediaRepository mediaRepository, UserRepository userRepository) {
        this.mediaRepository = mediaRepository;
        this.userRepository = userRepository;
    }

    @Override
    public MediaResponseDto uploadMedia(MediaRequestDto mediaRequestDto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        MultipartFile file = mediaRequestDto.getFile();

        // Dosya adını olduğu gibi kullanıyoruz. NOT: Decap CMS, resim alanının değerini
        // (public_folder + seçilen dosyanın adı) şeklinde KENDİ İÇİNDE oluşturuyor —
        // yani sunucudaki gerçek dosya adı ile bu bileşik yol MUTLAKA aynı olmalı.
        // Önceden UUID öneki eklediğimiz için post içindeki görsel her zaman "bulunamadı"
        // hatası veriyordu. Aynı isimli dosya tekrar yüklenirse üzerine yazılır.
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());

        try {
            // Uploads klasörü yoksa oluştur
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Dosyayı diske kaydet
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Veritabanı kaydını oluştur
            Media media = new Media();
            media.setFileName(fileName);
            // Frontend'in görseli çekebilmesi için yönlendirme URL'i
            media.setFileUrl("/uploads/" + fileName);
            media.setFileType(file.getContentType());
            media.setFileSize(file.getSize());
            media.setUser(user);

            mediaRepository.save(media);

            return new MediaResponseDto(
                    String.valueOf(media.getId()),
                    media.getFileName(),
                    toAbsoluteUrl(media.getFileUrl()),
                    media.getFileSize()
            );

        } catch (IOException ex) {
            throw new RuntimeException("Dosya kaydedilirken bir hata oluştu: " + fileName, ex);
        }
    }

    // Veritabanında göreli path ("/uploads/xxx.jpeg") saklasak bile,
    // frontend'e her zaman isteğin geldiği domain (ngrok dahil) ile mutlak URL döndürüyoruz.
    // Böylece CMS paneli farklı bir origin'den açılsa bile görsel adresi doğru çözülür.
    private String toAbsoluteUrl(String fileUrl) {
        if (fileUrl == null || fileUrl.startsWith("http")) {
            return fileUrl;
        }
        String baseUrl = ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString();
        return baseUrl + fileUrl;
    }

    @Override
    public List<MediaResponseDto> getUserMedia(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı."));

        // Sadece giriş yapan kullanıcıya ait görselleri çekiyoruz
        List<Media> userMedia = mediaRepository.findAllByUserId(user.getId());

        return userMedia.stream()
                .map(media -> new MediaResponseDto(
                        String.valueOf(media.getId()),
                        media.getFileName(),
                        toAbsoluteUrl(media.getFileUrl()),
                        media.getFileSize()
                ))
                .collect(Collectors.toList());
    }

    @Transactional
    @Override
    public void deleteMedia(Long id, String username) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Medya bulunamadı."));

        // Silmeye çalışan kişi, medyayı yükleyen kişi mi kontrolü
        if (!media.getUser().getUsername().equals(username)) {
            throw new RuntimeException("Bu dosyayı silme yetkiniz yok.");
        }

        try {
            // Dosyayı diskten fiziksel olarak sil
            Path filePath = Paths.get(uploadDir).resolve(media.getFileName());
            Files.deleteIfExists(filePath);

            // Veritabanından sil
            mediaRepository.delete(media);

            System.out.println("Silindi mi? " + mediaRepository.existsById(id));
        } catch (IOException ex) {
            throw new RuntimeException("Dosya fiziksel olarak silinemedi.", ex);
        }
    }
}