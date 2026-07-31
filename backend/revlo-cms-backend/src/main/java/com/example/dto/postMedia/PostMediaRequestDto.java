package com.example.dto.postMedia;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

// Post içeriğinde kullanılacak tek bir görsel referansı. Listedeki SIRA,
// gösterim sırasını (sortOrder) belirler.
@Data
public class PostMediaRequestDto {

    @NotNull(message = "Medya id boş bırakılamaz")
    private Long mediaId;

    @Size(max = 500, message = "Açıklama en fazla 500 karakter olabilir")
    private String caption;
}