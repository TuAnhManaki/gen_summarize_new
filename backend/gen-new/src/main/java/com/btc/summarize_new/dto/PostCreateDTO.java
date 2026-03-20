package com.btc.summarize_new.dto;

import com.btc.summarize_new.model.data.PostMeta;

import lombok.Data;

@Data
public class PostCreateDTO {
    private String title;
    private String slug;
    private String content;
    private Integer categoryId; // Angular gửi lên ID, không gửi cả object
    private String status;   // DRAFT, PUBLISHED...
    private PostMeta metaData; // JSONB map thẳng vào đây
}