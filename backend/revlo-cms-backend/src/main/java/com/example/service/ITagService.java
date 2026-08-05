package com.example.service;

import com.example.dto.tag.TagDeleteResultDto;
import com.example.dto.tag.TagResponseDto;

import java.util.List;

public interface ITagService {
    List<TagResponseDto> getAllTags();
    TagDeleteResultDto deleteTag(Long id, boolean isAdmin, boolean confirm);
}