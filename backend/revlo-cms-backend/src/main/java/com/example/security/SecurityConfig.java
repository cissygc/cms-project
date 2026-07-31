package com.example.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final UserDetailsServiceImpl userDetailsService;
    private final AuthTokenFilter authTokenFilter;

    public SecurityConfig(UserDetailsServiceImpl userDetailsService, AuthTokenFilter authTokenFilter) {
        this.userDetailsService = userDetailsService;
        this.authTokenFilter = authTokenFilter;
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider() {
        // Spring Security'nin yeni sürümlerinde no-arg constructor ve
        // setUserDetailsService(...) kaldırıldı/deprecated oldu.
        // Artık UserDetailsService constructor üzerinden veriliyor.
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());

        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configure(http))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth ->
                        auth.requestMatchers("/api/auth/signin").permitAll()
                                // Artık herkes kayıt olamıyor - sadece giriş yapmış bir ADMIN
                                // yeni kullanıcı (editör) oluşturabilir.
                                .requestMatchers("/api/auth/signup").hasAuthority("ADMIN")
                                // CMS'i kullanan kişinin kendi sitesi (frontend) için:
                                // giriş yapmadan post okuyabilsin diye herkese açık.
                                .requestMatchers("/api/public/**").permitAll()
                                .requestMatchers("/api/entries/**").authenticated()
                                .requestMatchers("/api/media/**").authenticated()
                                .requestMatchers("/api/users/me").authenticated()
                                // Kullanıcı yönetimi (listeleme + silme) sadece ADMIN'e açık
                                .requestMatchers("/api/users/**").hasAuthority("ADMIN")
                                .requestMatchers("/api/dashboard/**").authenticated()
                                // Swagger / OpenAPI dokümantasyonu herkese açık
                                .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                                .anyRequest().permitAll()
                );

        http.authenticationProvider(authenticationProvider());
        http.addFilterBefore(authTokenFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}