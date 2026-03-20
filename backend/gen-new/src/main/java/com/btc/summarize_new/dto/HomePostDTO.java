package com.btc.summarize_new.dto;

import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HomePostDTO {
 private UUID id;
 private String title;
 private String slug;
 private String categoryName;
 private String date;       // Format sẵn string cho FE đỡ xử lý: "Dec 10, 2016"
 private String image;      // Lấy từ metaData.thumbnail
 private String excerpt;    // Lấy từ metaData.summary
 private int views;         // Lấy từ metaData.stats.views
}