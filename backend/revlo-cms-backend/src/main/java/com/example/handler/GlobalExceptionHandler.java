package com.example.handler;

import com.example.exception.BaseException;
import com.example.exception.MessageType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = {BaseException.class})
    public ResponseEntity<ApiError<String>> handleBaseException(BaseException exception, WebRequest request) {
        return ResponseEntity.badRequest().body(createApiError(exception.getMessage(), request));
    }

    // Spring Security'nin authenticationManager.authenticate() çağrısında fırlattığı
    // TÜM giriş hataları (yanlış şifre -> BadCredentialsException, kullanıcı yok
    // -> UsernameNotFoundException/InternalAuthenticationServiceException) bu tek
    // handler'a düşer. Önceden burası eksikti, ikisi de genel Exception
    // handler'a düşüp 500 dönüyordu - şimdi düzgün bir 401 dönüyor.
    // Kullanıcı adının var olup olmadığını belli etmemek için (güvenlik) her
    // ikisinde de AYNI genel mesaj döndürüyoruz.
    @ExceptionHandler(value = {AuthenticationException.class})
    public ResponseEntity<ApiError<String>> handleAuthenticationException(AuthenticationException exception, WebRequest request) {
        ApiError<String> apiError = createApiError("Kullanıcı adı veya şifre hatalı", request);
        apiError.setStatus(HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiError);
    }

    private String getHostName() {
        try {
            return InetAddress.getLocalHost().getHostName();
        } catch (UnknownHostException ex) {
            System.out.println("Error occurred while getting hostname: " + ex.getMessage());
        }
        return "Unknown Host";
    }

    public <E> ApiError<E> createApiError(E message, WebRequest request) {
        ApiError<E> apiError = new ApiError<>();
        ApiErrorDetails<E> errorDetails = new ApiErrorDetails<>();

        apiError.setStatus(HttpStatus.BAD_REQUEST.value());

        errorDetails.setCreateTime(new Date());
        errorDetails.setHostName(getHostName());
        errorDetails.setPath(request.getDescription(false));
        errorDetails.setMessage(message);

        apiError.setException(errorDetails);
        return apiError;
    }

    @ExceptionHandler(value = {MethodArgumentNotValidException.class})
    public ResponseEntity<ApiError<String>> handleValidationException(MethodArgumentNotValidException exception, WebRequest request) {

        String errorMessage = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .findFirst()
                .orElse(MessageType.VALIDATION_ERROR.getMessage());

        return ResponseEntity.badRequest().body(createApiError(errorMessage, request));
    }

    @ExceptionHandler(value = {MaxUploadSizeExceededException.class})
    public ResponseEntity<ApiError<String>> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException exception, WebRequest request) {
        // Öncesinde bu hata genel handler'a düşüp kullanıcıya belirsiz bir 500 dönüyordu.
        return ResponseEntity.badRequest().body(createApiError("Dosya boyutu izin verilen en fazla boyutu (10 MB) geçiyor", request));
    }

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<ApiError<String>> handleGeneralException(Exception exception, WebRequest request) {

        // Loglara asıl hatayı basarız ki geliştirici olarak biz görelim
        System.out.println("Sistemde beklenmeyen bir hata koptu: " + exception.getMessage());

        // Kullanıcıya ise sadece kibar bir "Genel hata oluştu" JSON'u döneriz
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createApiError(MessageType.GENERAL_EXCEPTION.getMessage(), request));
    }
}