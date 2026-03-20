package com.btc.summarize_new.dto;

import java.util.List;

import com.btc.summarize_new.dto.base.PageResponse;

import lombok.Data;

@Data
public class HomePostResponseDTO {
 private List<String> trendingTopics; // Dòng chữ chạy (Ticker)
 private List<HomePostDTO> featuredPosts; // 3 bài Banner to
 private List<HomePostDTO> weeklyTop;     // 3 bài top view tuần
 private PageResponse<HomePostDTO> latestNews;    // Danh sách bài mới nhất (có phân trang)
 private HomePostSidebarDTO sidebar;              // Cột bên phải
}
