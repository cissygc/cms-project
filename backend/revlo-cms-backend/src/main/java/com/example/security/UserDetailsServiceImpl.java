package com.example.security;

import com.example.entity.User;
import com.example.repository.UserRepository;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    public UserDetailsServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Kullanıcı bulunamadı: " + username));

        // enabled=false verirsek Spring Security otomatik olarak DisabledException
        // fırlatır, GlobalExceptionHandler bunu genel AuthenticationException olarak
        // yakalayıp standart "kullanıcı adı veya şifre hatalı" mesajını döner - hesabın
        // "silinmiş" olduğunu dışarıya sızdırmıyoruz (kullanıcı adı numaralandırmasını önlemek için).
        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                !user.isDeleted(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                // getName() yerine Enum adını string olarak almak için .name() kullanıyoruz
                Collections.singletonList(new SimpleGrantedAuthority(user.getRole().name()))
        );
    }
}