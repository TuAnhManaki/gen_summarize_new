package com.btc.summarize_new.dto;

import lombok.Data;
import java.util.List;

@Data
public class BlogDashboardDTO {
    // 4 Thẻ Stats
    private long totalPosts;
    private long totalViews;
    private long totalComments;
    private long pendingComments; // Ví dụ đếm số comment chưa duyệt

    // Danh sách bài viết Hot
    private List<PostStatDTO> popularPosts;

    // Danh sách comment mới
    private List<CommentStatDTO> recentComments;
    
    @Data
    public static class PostStatDTO {
        private String title;
        private int views;
        private int likes;
    }
    
    @Data
    public static class CommentStatDTO {
        private String username;
        private String content;
        private String timeAgo; // Xử lý ở Java hoặc Frontend
    }
}