package com.example.service.impl;

import com.example.dto.user.UpdateProfileRequestDto;
import com.example.dto.user.UserResponseDto;
import com.example.entity.Role;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.MediaRepository;
import com.example.repository.PostRepository;
import com.example.repository.UserRepository;
import com.example.service.IUserService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements IUserService {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final MediaRepository mediaRepository;

    public UserServiceImpl(UserRepository userRepository, PostRepository postRepository, MediaRepository mediaRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.mediaRepository = mediaRepository;
    }

    @Override
    public List<UserResponseDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> toDto(user, postRepository.countByAuthor_Id(user.getId())))
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDto getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı")));
        return toDto(user, postRepository.countByAuthor_Id(user.getId()));
    }

    @Override
    public UserResponseDto updateMyProfile(String username, UpdateProfileRequestDto dto) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı")));

        if (dto.getFullName() != null) {
            user.setFullName(dto.getFullName());
        }
        if (dto.getBio() != null) {
            user.setBio(dto.getBio());
        }
        if (dto.getAvatarUrl() != null) {
            user.setAvatarUrl(dto.getAvatarUrl());
        }
        if (dto.getSlug() != null && !dto.getSlug().equals(user.getSlug())) {
            if (userRepository.existsBySlug(dto.getSlug())) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu slug zaten kullanımda"));
            }
            user.setSlug(dto.getSlug());
        }

        User saved = userRepository.save(user);
        return toDto(saved, postRepository.countByAuthor_Id(saved.getId()));
    }

    private UserResponseDto toDto(User user, long postCount) {
        return new UserResponseDto(
                user.getId(),
                user.getUsername(),
                user.getFullName(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getSlug(),
                user.getRole().name(),
                postCount
        );
    }

    @Override
    public void deleteUser(Long id, String currentUsername) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Kullanıcı bulunamadı")));

        // Kendi hesabını silmesini engelle
        if (user.getUsername().equals(currentUsername)) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Kendi hesabınızı silemezsiniz"));
        }

        // Sistemdeki son ADMIN'in silinmesini engelle
        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN)
                    .count();
            if (adminCount <= 1) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Sistemdeki son ADMIN kullanıcı silinemez"));
            }
        }

        // Kullanıcının yazıları varsa engelle (yazı silmeden/yazar değiştirmeden kullanıcı silinemez)
        long postCount = postRepository.countByAuthor_Id(user.getId());
        if (postCount > 0) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                    "Bu kullanıcının " + postCount + " adet yazısı var. Önce bu yazıları silin veya başka bir yazara aktarın"));
        }

        // Kullanıcının yüklediği medya varsa engelle
        long mediaCount = mediaRepository.countByUserId(user.getId());
        if (mediaCount > 0) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR,
                    "Bu kullanıcının " + mediaCount + " adet yüklediği medya var. Önce bunları silin"));
        }

        userRepository.delete(user);
    }
}