package com.btc.summarize_new.dto.blog;

import java.util.List;

//4. DTO Tổng hợp cho API Trang Chủ
public record HomeOverviewResponse(
		List<String> trendingTags, 
		HeroSectionDTO heroSection,
		List<CategoryBoxDTO> categoryBoxes) {
}