package com.example.service.impl;

import com.example.dto.user.UpdateProfileRequestDto;
import com.example.dto.user.UserResponseDto;
import com.example.entity.Role;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
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

    public UserServiceImpl(UserRepository userRepository, PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
    }

    @Override
    public List<UserResponseDto> getAllUsers(boolean includeDeleted) {
        return userRepository.findAll().stream()
                .filter(user -> includeDeleted || !user.isDeleted())
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
                user.isDeleted(),
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

        if (user.isDeleted()) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu kullanıcı zaten silinmiş"));
        }

        // Sistemdeki son (silinmemiş) ADMIN'in silinmesini engelle
        if (user.getRole() == Role.ADMIN) {
            long activeAdminCount = userRepository.findAll().stream()
                    .filter(u -> u.getRole() == Role.ADMIN && !u.isDeleted())
                    .count();
            if (activeAdminCount <= 1) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Sistemdeki son ADMIN kullanıcı silinemez"));
            }
        }

        // Soft delete: hesap kalıcı olarak silinmiyor, sadece pasifleştiriliyor.
        // Yazıları/medyaları olduğu için engelleme YOK artık - içerik kalıcı olarak
        // yaşamaya devam ediyor, sadece hesap girişi kapanıyor. Bkz. User.deleted
        // alanındaki yorum ve UserDetailsServiceImpl (login engeli burada uygulanıyor).
        user.setDeleted(true);
        userRepository.save(user);
    }
}