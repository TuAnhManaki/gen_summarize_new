package com.btc.summarize_new.dto.blog;

import org.springframework.data.domain.Page;
import java.time.LocalDateTime;
import java.util.List;

public class CategoryDto {

    // DTO gộp toàn bộ dữ liệu của trang Chuyên mục
    public record CategoryPageResponse(
            String categoryName,
            String categoryDescription,
            ArticleItem heroMainArticle,
            List<ArticleItem> heroSubArticlesCol1,
            List<ArticleItem> heroSubArticlesCol2,
            List<ArticleItem> popularArticles,
            List<SourceFilterDto> sourcesFilter
    ) {}

    // DTO cho từng bài viết (rút gọn)
    public record ArticleItem(
            Long id,
            String title,
            String excerpt,
            String thumbnailUrl,
            SourceDto source,
            LocalDateTime publishedAt,
            Integer views,
            String nameSlug
    ) {}

    // DTO cho Nguồn bài viết
    public record SourceDto(
            String name,
            String slug,
            String colorClass,
            String bgClass
    ) {}

    // DTO cho bộ lọc Nguồn bên Sidebar
    public record SourceFilterDto(
            String id, // slug của nguồn
            String name,
            Boolean checked,
            String colorClass
    ) {}

    // Custom Page để bọc dữ liệu phân trang
    public record PageData<T>(
            List<T> content,
            int currentPage,
            int totalPages,
            long totalElements
    ) {
        public PageData(Page<T> page) {
            this(page.getContent(), page.getNumber() + 1, page.getTotalPages(), page.getTotalElements());
        }
    }
    
}