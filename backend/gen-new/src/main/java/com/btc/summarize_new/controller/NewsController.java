package com.btc.summarize_new.controller;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.btc.summarize_new.dto.blog.ArticleDTO;
import com.btc.summarize_new.dto.blog.CategoryDto.CategoryPageResponse;
import com.btc.summarize_new.dto.blog.HomeOverviewResponse;
import com.btc.summarize_new.dto.blog.NewsDto.ArticleDetail;
import com.btc.summarize_new.dto.blog.NewsDto.ArticleItem;
import com.btc.summarize_new.dto.blog.NewsDto.SummaryResponse;
import com.btc.summarize_new.service.NewsCategoryService;
import com.btc.summarize_new.service.NewsDetailService;
import com.btc.summarize_new.service.NewsDisplayService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/news")
@RequiredArgsConstructor
//@CrossOrigin(origins = "http://localhost:4200")
public class NewsController {

	private final NewsDisplayService newsService;
	private final NewsDetailService newsDService;

	private final NewsCategoryService categoryService;

	/**
	 * API 1: Lấy toàn bộ dữ liệu tĩnh cho phần trên của Trang chủ Trả về: Trending
	 * Tags, Hero Section, Category Boxes
	 */
	@GetMapping("/home/overview")
	public ResponseEntity<HomeOverviewResponse> getHomeOverview() {
		HomeOverviewResponse response = newsService.getHomeOverview();
		return ResponseEntity.ok(response);
	}

	/**
	 * API 2: Lấy danh sách tin Feed (Có phân trang và Filter) Ví dụ gọi:
	 * /api/v1/news/feed?page=0&size=10&sources=VnExpress,Tuổi Trẻ
	 */
	@GetMapping("/feed")
	public ResponseEntity<Page<ArticleDTO>> getNewsFeed(@RequestParam(defaultValue = "0", name = "page") int page,
			@RequestParam(defaultValue = "10", name = "size") int size,
			@RequestParam(value = "sources", required = false) List<String> sources,
			@RequestParam(value = "categories", required = false) List<String> cate) {

		// Sort bài viết mới nhất lên đầu
		PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "publishedAt"));

		Page<ArticleDTO> feedPage = newsService.getNewsFeed(sources, cate, pageRequest);
		return ResponseEntity.ok(feedPage);
	}

//    cho new detail 

	// 1. API chi tiết bài viết
	@GetMapping("/{slug}")
	public ResponseEntity<ArticleDetail> getArticle(@PathVariable("slug") String slug) {
		return ResponseEntity.ok(newsDService.getArticleDetail(slug));
	}

	// 2. API tin liên quan
	@GetMapping("/{slug}/related")
	public ResponseEntity<List<ArticleItem>> getRelatedNews(@PathVariable("slug") String islugd) {
		return ResponseEntity.ok(newsDService.getRelatedNews(islugd));
	}

	// 3. API yêu cầu tóm tắt AI
	@PostMapping("/{id}/summarize")
	public ResponseEntity<SummaryResponse> summarizeArticle(@PathVariable("id") Long id) {
		return ResponseEntity.ok(newsDService.summarizeArticle(id));
	}

	@GetMapping("/category/{slug}")
	public ResponseEntity<CategoryPageResponse> getCategoryPage(@PathVariable("slug") String slug) {
		return ResponseEntity.ok(categoryService.getCategoryPageData(slug));
	}
}