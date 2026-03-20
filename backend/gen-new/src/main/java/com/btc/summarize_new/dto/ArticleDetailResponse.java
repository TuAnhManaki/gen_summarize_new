package com.btc.summarize_new.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ArticleDetailResponse {
    private Long id;
    private String title;
    private String category;
    private String author;
    private String date;
    private Integer views;
    private Integer commentsCount;
    private String image;
    
    // Hai trường nội dung quan trọng để Frontend xử lý logic hiển thị
    private String rawContent; 
    private String summaryContent;
    
    private Boolean isSummarized;
    private List<String> tags;
}