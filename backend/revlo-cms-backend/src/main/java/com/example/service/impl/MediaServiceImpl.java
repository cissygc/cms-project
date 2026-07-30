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

        // Kullanıcıya gösterilecek orijinal dosya adı (değişmeden saklanır, sadece görüntüleme amaçlı)
        String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

        // Diskte fiziksel olarak duracak, ÇAKIŞMAYA KARŞI benzersiz ad.
        // NOT: Daha önce dosya adı hiç değiştirilmeden kaydediliyordu ve aynı isimli
        // dosya tekrar yüklendiğinde (örn. iki farklı editörün telefonundan gelen
        // "IMG_0001.jpg") REPLACE_EXISTING nedeniyle birbirinin dosyasının üzerine
        // yazılıyordu. Şimdi her yüklemeye UUID öneki ekliyoruz, böylece aynı isimli
        // dosyalar asla çakışmıyor; orijinal isim ayrı bir alanda (fileName) duruyor.
        String storedFileName = java.util.UUID.randomUUID() + "_" + originalFileName;

        try {
            // Uploads klasörü yoksa oluştur
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Dosyayı diske kaydet (artık üzerine yazma riski yok, ama REPLACE_EXISTING
            // yine de bırakılıyor çünkü storedFileName pratikte zaten benzersiz)
            Path filePath = uploadPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Veritabanı kaydını oluştur
            Media media = new Media();
            media.setFileName(originalFileName);
            media.setStoredFileName(storedFileName);
            // Frontend'in görseli çekebilmesi için yönlendirme URL'i.
            // ÖNEMLİ: storedFileName; boşluk, '#', '%' gibi karakterler içerebilir
            // (örn. "#reeonn #domundi.jpeg"). Bunlar URL-encode edilmeden
            // <img src> içinde kullanılırsa tarayıcı '#' sonrasını "fragment"
            // sayıp görseli hiç isteyemez (kırık görsel ikonu). Bu yüzden
            // sadece dosya adını URL-encode ediyoruz, diskteki gerçek dosya
            // adı (media.getStoredFileName()) her zaman ORİJİNAL/encode edilmemiş
            // haliyle kalıyor.
            media.setFileUrl("/uploads/" + encodeUrlSegment(storedFileName));
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
            throw new RuntimeException("Dosya kaydedilirken bir hata oluştu: " + originalFileName, ex);
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
                        // URL'i her zaman media.getStoredFileName()'den TAZE olarak (encode
                        // ederek) kuruyoruz; stored fileUrl'e güvenmiyoruz. NOT: storedFileName
                        // eklenmeden önce kaydedilmiş eski medya kayıtlarında bu alan boş
                        // olabilir - bu durumda geriye dönük uyumluluk için fileName'e düşüyoruz.
                        toAbsoluteUrl("/uploads/" + encodeUrlSegment(
                                media.getStoredFileName() != null ? media.getStoredFileName() : media.getFileName())),
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
            // Dosyayı diskten fiziksel olarak sil - storedFileName eklenmeden önceki
            // kayıtlarda bu alan boş olabileceği için fileName'e düşüyoruz.
            String diskFileName = media.getStoredFileName() != null ? media.getStoredFileName() : media.getFileName();
            Path filePath = Paths.get(uploadDir).resolve(diskFileName);
            Files.deleteIfExists(filePath);

            // Veritabanından sil
            mediaRepository.delete(media);

            System.out.println("Silindi mi? " + mediaRepository.existsById(id));
        } catch (IOException ex) {
            throw new RuntimeException("Dosya fiziksel olarak silinemedi.", ex);
        }
    }
}