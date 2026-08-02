package com.example.dto.tag;

import lombok.AllArgsConstructor;
import lombok.Data;

// Collections'daki CollectionDeleteResultDto ile aynı desen - içinde yazı
// olan bir tag silinirken önce onay isteniyor (bkz. TagServiceImpl.deleteTag).
@Data
@AllArgsConstructor
public class TagDeleteResultDto {
    private boolean deleted;
    private long affectedPostCount;
    private String message;
}