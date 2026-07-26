package com.example.dto.media;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class MediaRequestDto {

    // Spring'in dosya yüklemelerini yakaladığı sınıf MultipartFile'dır
    @NotNull(message = "Yüklenecek dosya boş olamaz")
    private MultipartFile file;

    // İleride Decap CMS'ten veya başka bir yerden alt metin/açıklama gelirse
    // buraya "private String altText;" şeklinde kolayca ekleyebiliriz.
}