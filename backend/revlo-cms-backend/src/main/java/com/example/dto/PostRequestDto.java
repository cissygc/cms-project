package com.example.dto;

import lombok.Data;

@Data
public class PostRequestDto {
    private String title;
    private String body;
    private String author;
}