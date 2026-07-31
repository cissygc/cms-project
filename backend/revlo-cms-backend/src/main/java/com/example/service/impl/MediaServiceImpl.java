package com.example.service.impl;

import com.example.dto.media.MediaRequestDto;
import com.example.dto.media.MediaResponseDto;
import com.example.entity.Media;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.MediaRepository;
import com.example.repository.UserRepository;
import com.example.service.IMediaService;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı")));

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
            // Frontend'in görseli çekebilmesi için yönlendirme URL'i.
            // ÖNEMLİ: fileName; boşluk, '#', '%' gibi karakterler içerebilir
            // (örn. "#reeonn #domundi.jpeg"). Bunlar URL-encode edilmeden
            // <img src> içinde kullanılırsa tarayıcı '#' sonrasını "fragment"
            // sayıp görseli hiç isteyemez (kırık görsel ikonu). Bu yüzden
            // sadece dosya adını URL-encode ediyoruz, diskteki gerçek dosya
            // adı (media.getFileName()) her zaman ORİJİNAL/encode edilmemiş
            // haliyle kalıyor.
            media.setFileUrl("/uploads/" + encodeUrlSegment(fileName));
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
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı")));

        // Sadece giriş yapan kullanıcıya ait görselleri çekiyoruz
        List<Media> userMedia = mediaRepository.findAllByUserId(user.getId());

        return userMedia.stream()
                .map(media -> new MediaResponseDto(
                        String.valueOf(media.getId()),
                        media.getFileName(),
                        // Eski (bu düzeltmeden önce) yüklenmiş kayıtların fileUrl'i encode
                        // edilmemiş olabilir. Bu yüzden URL'i her zaman media.getFileName()'den
                        // TAZE olarak (encode ederek) kuruyoruz; stored fileUrl'e güvenmiyoruz.
                        toAbsoluteUrl("/uploads/" + encodeUrlSegment(media.getFileName())),
                        media.getFileSize()
                ))
                .collect(Collectors.toList());
    }

    // Dosya adındaki boşluk, '#', '%', 'ç'/'ş' gibi Türkçe karakterleri vs.
    // URL'de güvenli hale getirir. URLEncoder query-string encoding kullandığı
    // için boşluğu '+' yapar; path segmentinde bu yanlış olacağından '%20'ye çeviriyoruz.
    private String encodeUrlSegment(String segment) {
        try {
            return URLEncoder.encode(segment, StandardCharsets.UTF_8.name()).replace("+", "%20");
        } catch (UnsupportedEncodingException e) {
            return segment;
        }
    }

    @Transactional
    @Override
    public void deleteMedia(Long id, String username) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Medya bulunamadı")));

        // Silmeye çalışan kişi, medyayı yükleyen kişi mi kontrolü
        if (!media.getUser().getUsername().equals(username)) {
            throw new BaseException(new ErrorMessage(MessageType.UNAUTHORIZED_ACCESS, "Bu dosyayı silme yetkiniz yok"));
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