package com.example.dto.post;

import com.example.dto.postMedia.PostMediaRequestDto;
import com.example.dto.postSeo.PostSeoRequestDto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class PostRequestDto {

    @NotBlank(message = "Slug (URL uzantısı) boş bırakılamaz")
    @Size(max = 150, message = "Slug en fazla 150 karakter olabilir")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug sadece küçük harf, rakam ve tire (-) içerebilir, örn: merhaba-dunya")
    private String slug;

    @NotBlank(message = "Başlık boş bırakılamaz")
    @Size(max = 300, message = "Başlık en fazla 300 karakter olabilir")
    private String title;

    // Opsiyonel - kapak görseli olarak kullanılacak medyanın id'si (Media kütüphanesinden
    // seçilir). Artık düz bir URL string DEĞİL, gerçek bir medya referansı.
    // NOT: updatePost'ta gönderilmezse (null) mevcut kapak KORUNUR - kapağı bilerek
    // kaldırmak için removeCover=true göndermek gerekir (bkz. removeCover alanı).
    private Long coverMediaId;

    // Sadece updatePost'ta anlamlı - true gönderilirse kapak görseli bilerek
    // kaldırılır. coverMediaId de doluysa coverMediaId öncelikli sayılır.
    private boolean removeCover = false;

    @NotBlank(message = "İçerik boş bırakılamaz")
    private String content;

    // Opsiyonel - gönderilmezse yeni yazılarda DRAFT varsayılır (bkz. PostServiceImpl)
    private String status;

    // Opsiyonel - gönderilmezse TR varsayılır (bkz. PostServiceImpl.parseLanguage)
    private String language;

    // Opsiyonel - yazının atandığı koleksiyon id'leri
    private List<Long> collectionIds;

    // Opsiyonel - kapak görseli HARİÇ, içerik içinde gösterilecek sıralı görseller.
    // Listedeki sıra = gösterim sırası. Gönderilmezse (null) mevcut liste korunur
    // (bkz. PostServiceImpl.updatePost); boş [] gönderilirse tüm görseller kaldırılır.
    private List<PostMediaRequestDto> media;

    // Opsiyonel - serbest metin etiket isimleri. Var olmayan bir isim otomatik
    // oluşturulur (bkz. PostServiceImpl.resolveTags). Null = mevcut etiketler
    // korunur, [] = tüm etiketler kaldırılır (collectionIds ile aynı mantık).
    private List<String> tagNames;

    // Opsiyonel - hiç gönderilmezse tüm SEO alanları fallback'e düşer (bkz. PostServiceImpl.resolveSeo)
    @Valid
    private PostSeoRequestDto seo;

    // Opsiyonel - dolu ve status=DRAFT ise "zamanlanmış yayın" anlamına gelir,
    // PostPublishScheduler bu tarih geldiğinde otomatik PUBLISHED yapar.
    // status=PUBLISHED gönderilirse bu alanın bir etkisi olmaz (yazı zaten yayında).
    private LocalDateTime publishAt;
}