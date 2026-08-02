package com.example.dto.postSeo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Bunlar HAM (editörün girdiği) değerler DEĞİL - fallback zinciri uygulanmış,
// doğrudan <meta> etiketlerine basılmaya hazır NİHAİ değerler. Frontend hiçbir
// "boşsa şunu kullan" mantığı yazmak zorunda kalmasın diye bu hesaplama
// backend'de yapılıyor (bkz. PostServiceImpl.resolveSeo).
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostSeoResponseDto {
    private String metaTitle;
    private String metaDescription;
    private String ogImageUrl;
    private String canonicalUrl;
    private boolean noIndex;
}