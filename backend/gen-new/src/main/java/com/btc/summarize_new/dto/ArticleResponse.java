package com.btc.summarize_new.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ArticleResponse {
    private Long id;
    private String slug;
    private String title;
    private String image;
    private String category;
    private String excerpt; // Chứa nội dung tóm tắt của AI
    private String date;
    private int views;
}