package com.btc.summarize_new.dto.blog;

import java.time.LocalDateTime;

//1. DTO Cơ bản cho Bài viết
public record ArticleDTO(
 String id,
 String title,
 String excerpt,
 String thumbnailUrl,
 SourceDTO source,
 LocalDateTime publishedAt,
 String categoryName,
 String url,
 String nameSlug
) {}