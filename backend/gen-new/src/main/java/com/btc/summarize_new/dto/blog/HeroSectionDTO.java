package com.btc.summarize_new.dto.blog;

import java.util.List;

//2. DTO cho Hero Section (1 tin chính, 4 tin phụ)
public record HeroSectionDTO(
 ArticleDTO mainArticle,
 List<ArticleDTO> subArticles // Danh sách 4 tin nhỏ
) {}