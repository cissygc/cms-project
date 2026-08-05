package com.example.service.impl;

import com.example.dto.auth.JwtResponseDto;
import com.example.dto.auth.LoginRequestDto;
import com.example.dto.auth.RegisterRequestDto;
import com.example.dto.auth.RegisterResponseDto;
import com.example.entity.Media;
import com.example.entity.Role;
import com.example.entity.User;
import com.example.exception.BaseException;
import com.example.exception.ErrorMessage;
import com.example.exception.MessageType;
import com.example.repository.MediaRepository;
import com.example.repository.UserRepository;
import com.example.security.JwtUtils;
import com.example.service.IAuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuthServiceImpl implements IAuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;
    private final MediaRepository mediaRepository;
    private final PasswordEncoder passwordEncoder;

    // RoleRepository bağımlılığını sildik
    public AuthServiceImpl(AuthenticationManager authenticationManager,
                           JwtUtils jwtUtils,
                           UserRepository userRepository,
                           MediaRepository mediaRepository,
                           PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.userRepository = userRepository;
        this.mediaRepository = mediaRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public JwtResponseDto authenticateUser(LoginRequestDto loginRequestDto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequestDto.getUsername(),
                        loginRequestDto.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication.getName());

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        String userRole = roles.isEmpty() ? null : roles.get(0);

        return new JwtResponseDto(jwt, "Bearer", userDetails.getUsername(), userRole);
    }

    @Override
    public RegisterResponseDto registerUser(RegisterRequestDto registerRequestDto) {
        // 1. Kullanıcı adı daha önce alınmış mı kontrolü
        if (userRepository.findByUsername(registerRequestDto.getUsername()).isPresent()) {
            throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Bu kullanıcı adı zaten kullanımda"));
        }

        // 2. Yeni kullanıcı nesnesinin oluşturulması
        User user = new User();
        user.setUsername(registerRequestDto.getUsername());

        // Şifreyi hash'leyerek kaydediyoruz
        user.setPassword(passwordEncoder.encode(registerRequestDto.getPassword()));

        // 3. Enum yapısına uygun Rol ataması
        String strRole = registerRequestDto.getRole();
        Role userRole;

        if (strRole == null || strRole.trim().isEmpty()) {
            // Veritabanına gitmeye gerek kalmadan Enum'dan doğrudan alıyoruz
            userRole = Role.EDITOR;
        } else {
            try {
                // String'i güvenli bir şekilde Enum'a çeviriyoruz
                userRole = Role.valueOf(strRole.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BaseException(new ErrorMessage(MessageType.VALIDATION_ERROR, "Belirtilen rol bulunamadı"));
            }
        }

        user.setRole(userRole);

        // 4. Profil alanları
        user.setFullName(registerRequestDto.getFullName());
        user.setBio(registerRequestDto.getBio());
        if (registerRequestDto.getAvatarMediaId() != null) {
            Media avatarMedia = mediaRepository.findById(registerRequestDto.getAvatarMediaId())
                    .orElseThrow(() -> new BaseException(new ErrorMessage(MessageType.NO_RECORD_EXIST, "Profil fotoğrafı bulunamadı")));
            user.setAvatarMedia(avatarMedia);
        }
        user.setSlug(resolveSlug(registerRequestDto.getSlug(), registerRequestDto.getUsername()));

        // 5. Kullanıcıyı veritabanına kaydetme
        userRepository.save(user);

        return new RegisterResponseDto("Kullanıcı başarıyla oluşturuldu.");
    }
}