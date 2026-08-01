package com.example.service;

import com.example.dto.media.MediaRequestDto;
import com.example.dto.media.MediaResponseDto;

import java.util.List;

public interface IMediaService {
    MediaResponseDto uploadMedia(MediaRequestDto mediaRequestDto, String username);
    List<MediaResponseDto> getUserMedia(String username, boolean isAdmin);
    void deleteMedia(Long id, String username, boolean isAdmin);
}