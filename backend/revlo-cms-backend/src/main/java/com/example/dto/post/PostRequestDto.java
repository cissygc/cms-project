package com.example.dto.post;

import com.example.dto.postMedia.PostMediaRequestDto;
import com.example.dto.postSeo.PostSeoRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PostRequestDto {

    @NotBlank(message = "Slug (URL uzantısı) boş bırakılamaz")
    @Size(max = 150, message = "Slug en fazla 150 karakter olabilir")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir, örn: merhaba-dunya")
    private String slug;

    @NotBlank(message = "Başlık boş bırakılamaz")
    @Size(max = 300, message = "Başlık en fazla 300 karakter olabilir")
    private String title;

    // Opsiyonel medya alanı
    private String image;

    @NotBlank(message = "İçerik boş bırakılamaz")
    private String content;

    // Opsiyonel - gönderilmezse yeni yazılarda DRAFT varsayılır (bkz. PostServiceImpl)
    private String status;

    // Opsiyonel - gönderilmezse TR varsayılır (bkz. PostServiceImpl.parseLanguage)
    private String language;

    // Opsiyonel - yazının atandığı koleksiyon id'leri
    private java.util.List<Long> collectionIds;

    // Opsiyonel - kapak görseli HARİÇ, içerik içinde gösterilecek sıralı görseller.
    // Listedeki sıra = gösterim sırası. Gönderilmezse (null) mevcut liste korunur
    // (bkz. PostServiceImpl.updatePost); boş [] gönderilirse tüm görseller kaldırılır.
    private java.util.List<PostMediaRequestDto> media;

    // Opsiyonel - hiç gönderilmezse tüm SEO alanları fallback'e düşer (bkz. PostServiceImpl.resolveSeo)
    @Valid
    private PostSeoRequestDto seo;
}