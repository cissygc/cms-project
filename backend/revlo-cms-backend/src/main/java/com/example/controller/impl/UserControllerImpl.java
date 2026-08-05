package com.example.controller.impl;

import com.example.controller.IUserController;
import com.example.dto.user.UserResponseDto;
import com.example.service.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
public class UserControllerImpl implements IUserController {

    private final IUserService userService;

    public UserControllerImpl(IUserService userService) {
        this.userService = userService;
    }

    @Override
    public ResponseEntity<?> getAllUsers(boolean includeDeleted) {
        List<UserResponseDto> users = userService.getAllUsers(includeDeleted);
        return ResponseEntity.ok(users);
    }

    @Override
    public ResponseEntity<?> deleteUser(Long id, Authentication authentication) {
        userService.deleteUser(id, authentication.getName());
        return ResponseEntity.ok(Map.of("message", "Kullanıcı başarıyla silindi."));
    }
}
