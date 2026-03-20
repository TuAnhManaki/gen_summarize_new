package com.btc.summarize_new.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

import com.btc.summarize_new.model.data.PostMeta;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PostListDTO {
    private UUID id;
    private String title;
    private String slug;
    private String categoryName; // Chỉ cần tên để hiển thị
    private String status;
    private LocalDateTime createdAt;
    private PostMeta metaData; // Chứa thumbnail, views, tags...
}

