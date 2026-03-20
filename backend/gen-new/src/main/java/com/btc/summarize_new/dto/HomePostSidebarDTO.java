package com.btc.summarize_new.dto;

import java.util.List;

import lombok.Data;

@Data
public class HomePostSidebarDTO {
 private List<HomePostDTO> hotNews;    // Top view tháng
 private List<String> trendingTags;    // Tags phổ biến
}
