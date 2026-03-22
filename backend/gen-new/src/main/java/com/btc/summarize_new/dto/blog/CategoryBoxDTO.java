package com.btc.summarize_new.dto.blog;

import java.util.List;

//3. DTO cho Category Box
public record CategoryBoxDTO(
		String categoryName, 
		String colorClass, // VD: "text-blue-700"
		String Slug,
		ArticleDTO featuredArticle, // Tin có ảnh to
		List<ArticleDTO> listArticles // 2 tin gạch đầu dòng
) {
}
