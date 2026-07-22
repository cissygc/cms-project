package com.example.exception; // Paket ismini kendi projene göre düzenlemeyi unutma

import lombok.Getter;

@Getter
public enum MessageType {
    NO_RECORD_EXIST("1001", "No record found with the provided identifier"),
    GENERAL_EXCEPTION("9999", "An unexpected internal server error occurred"),
    VALIDATION_ERROR("1002", "The provided data is invalid or missing required fields");

    private final String code;
    private final String message;

    MessageType(String code, String message) {
        this.code = code;
        this.message = message;
    }
}