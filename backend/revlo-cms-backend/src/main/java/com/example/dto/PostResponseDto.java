package com.example.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class PostResponseDto{

    private Long id;


    private String title;


    private String body;


    private String author;


    private LocalDateTime createdAt;
}