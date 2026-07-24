package com.example.handler;

import com.example.exception.BaseException;
import com.example.exception.MessageType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Date;

@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(value = {BaseException.class})
    public ResponseEntity<ApiError<String>> handleBaseException(BaseException exception, WebRequest request) {
        return ResponseEntity.badRequest().body(createApiError(exception.getMessage(), request));
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

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<ApiError<String>> handleGeneralException(Exception exception, WebRequest request) {

        // Loglara asıl hatayı basarız ki geliştirici olarak biz görelim
        System.out.println("Sistemde beklenmeyen bir hata koptu: " + exception.getMessage());

        // Kullanıcıya ise sadece kibar bir "Genel hata oluştu" JSON'u döneriz
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createApiError(MessageType.GENERAL_EXCEPTION.getMessage(), request));
    }
}