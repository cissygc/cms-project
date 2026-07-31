package com.example.dto.collection;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CollectionRequestDto {

    @NotBlank(message = "Koleksiyon adı boş bırakılamaz")
    @Size(max = 100, message = "Koleksiyon adı en fazla 100 karakter olabilir")
    private String name;

    // Opsiyonel - boş bırakılırsa isimden otomatik üretilir (bkz. CollectionServiceImpl)
    @Size(min = 2, max = 100, message = "Slug 2 ile 100 karakter arasında olmalıdır")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir")
    private String slug;
}