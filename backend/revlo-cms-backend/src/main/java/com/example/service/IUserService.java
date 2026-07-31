package com.example.service;

import com.example.dto.user.UserResponseDto;

import java.util.List;

public interface IUserService {
    List<UserResponseDto> getAllUsers();
    void deleteUser(Long id, String currentUsername);
}
