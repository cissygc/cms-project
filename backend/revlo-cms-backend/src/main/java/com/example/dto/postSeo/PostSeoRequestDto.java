package com.example.dto.postSeo;

import jakarta.validation.constraints.Size;
import lombok.Data;

// Editörün BİLEREK girdiği ham SEO değerleri - hepsi opsiyonel. Google başlığı
// ~60, açıklamayı ~155-160 karakterde kestiği için sınırlar biraz payla
// (70/165) tutuldu: amaç editörü 1-2 karakter fazla yazdı diye engellemek
// değil, aşırı uzun (SEO'ya hiç faydası olmayan) girdileri önlemek.
@Data
public class PostSeoRequestDto {

    @Size(max = 70, message = "Meta başlık en fazla 70 karakter olmalı (Google ~60 karakterde kesiyor)")
    private String metaTitle;

    @Size(max = 165, message = "Meta açıklama en fazla 165 karakter olmalı (Google ~155-160 karakterde kesiyor)")
    private String metaDescription;

    // Boş bırakılırsa kapak görseli (Post.image) kullanılır
    private String ogImageUrl;

    // Boş bırakılırsa otomatik üretilir: https://revloai.com/{dil}/blog/{slug}
    private String canonicalUrl;

    // true ise arama motorlarına "bu sayfayı indeksleme" sinyali gönderilir
    // (örn. bir kampanya/duyuru yazısı arama sonuçlarında görünmesin istenirse)
    private boolean noIndex = false;
}