package com.example.controller.impl;

import com.example.controller.IMediaController;
import com.example.dto.media.MediaRequestDto;
import com.example.dto.media.MediaResponseDto;
import com.example.service.IMediaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class MediaControllerImpl implements IMediaController {

    private final IMediaService mediaService;

    public MediaControllerImpl(IMediaService mediaService) {
        this.mediaService = mediaService;
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ADMIN"));
    }

    @Override
    public ResponseEntity<?> uploadMedia(MediaRequestDto mediaRequestDto, Authentication authentication) {
        // Oturum açmış kullanıcının adını Spring Security Context'ten alıyoruz
        String username = authentication.getName();

        MediaResponseDto response = mediaService.uploadMedia(mediaRequestDto, username);
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<?> getUserMedia(Authentication authentication) {
        String username = authentication.getName();

        List<MediaResponseDto> response = mediaService.getUserMedia(username, isAdmin(authentication));
        return ResponseEntity.ok(response);
    }

    @Override
    public ResponseEntity<?> deleteMedia(Long id, Authentication authentication) {
        String username = authentication.getName();

        mediaService.deleteMedia(id, username, isAdmin(authentication));

        // Silme işlemi başarılı olduğunda JSON formatında basit bir mesaj dönüyoruz
        return ResponseEntity.ok(Map.of("message", "Medya başarıyla silindi."));
    }
}