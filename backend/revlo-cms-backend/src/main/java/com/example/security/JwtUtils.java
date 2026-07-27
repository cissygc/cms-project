package com.example.security;

import io.jsonwebtoken.Jwts;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {

    // 0.12.x sürümü için yeni güvenli anahtar oluşturma yöntemi
    private final SecretKey key = Jwts.SIG.HS256.key().build();

    // Token geçerlilik süresi (Örn: 24 saat)
    private final int jwtExpirationMs = 86400000;

    // Kullanıcı adı ile yeni bir JWT Token oluşturur
    public String generateJwtToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

    // Gelen Token'ın içinden kullanıcı adını çıkarır
    public String getUserNameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // Gelen Token'ın geçerli ve doğru imzalanmış olup olmadığını kontrol eder
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(authToken);
            return true;
        } catch (Exception e) {
            System.err.println("Geçersiz JWT Token: " + e.getMessage());
        }
        return false;
    }
}