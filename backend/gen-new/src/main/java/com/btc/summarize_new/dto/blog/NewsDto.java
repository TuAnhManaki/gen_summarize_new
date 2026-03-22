package com.btc.summarize_new.dto.blog;

import java.time.LocalDateTime;
import java.util.Map;

public class NewsDto {
    
    // DTO cho màn hình chi tiết
    public record ArticleDetail(
        Long id,
        String title,
        String category, // Lấy tên category thay vì nguyên object
        String source,   // Lấy tên source
        String author,
        LocalDateTime publishedAt,
        String rawContent,
        String originUrl,
        String summaryContent, // Nếu đã tóm tắt thì trả về luôn
        Map<String, Object> metadata
    ) {}

    // DTO cho danh sách tin liên quan (rút gọn dữ liệu)
    public record ArticleItem(
        Long id,
        String title,
        String thumbnailUrl, // Lấy từ metadata
        String source,
        LocalDateTime publishedAt,
        String nameSlug
        
    ) {}
    
    // DTO cho response tóm tắt
    public record SummaryResponse(String summary) {}
}
