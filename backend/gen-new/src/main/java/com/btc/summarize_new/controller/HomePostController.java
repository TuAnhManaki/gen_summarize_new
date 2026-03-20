package com.btc.summarize_new.controller;

import java.util.List;
import java.util.Random;


import org.springframework.data.domain.Page;

import org.springframework.data.domain.Pageable;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.btc.summarize_new.dto.ArticleResponse;
import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.repository.ArticleRepository;

//NewsHomeController.java
@RestController
@RequestMapping("/api/news/home")
@CrossOrigin(origins = "*")
public class HomePostController {

 @Autowired
 private ArticleRepository articleRepository;

 // Helper: Chuyển Entity sang DTO
 private ArticleResponse convertToDTO(Article article) {
     // Lấy ảnh từ metadata (nếu có), nếu không dùng ảnh mặc định
     String image = article.getMetadata().containsKey("thumb") 
             ? article.getMetadata().get("thumb").toString() 
             : "https://via.placeholder.com/800x500";
             
     // Lấy Category name, nếu null để mặc định
     String categoryName = article.getCategory() != null ? article.getCategory().getName() : "Tin tức";

     // Tạo slug từ ID (hoặc sau này bạn có thể tạo slug thật từ title)
     String slug = article.getId() + "-bai-viet";

     return new ArticleResponse(
         article.getId(),
         slug,
         article.getTitle(),
         image,
         categoryName,
         article.getSummaryContent(), // Đẩy nguyên HTML tóm tắt của AI ra
         article.getPublishedAt() != null ? article.getPublishedAt().toString() : "Vừa xong",
         new Random().nextInt(500) + 50 // Giả lập views (vì crawl chưa có views)
     );
 }
 
 // 1. API cho Featured Posts (3 bài to nhất trên cùng)
 @GetMapping("/featured")
 public ResponseEntity<List<ArticleResponse>> getFeaturedPosts() {
     // Lấy 3 bài mới nhất ĐÃ ĐƯỢC TÓM TẮT
     List<Article> articles = articleRepository.findTop3ByOrderByCreatedAtDesc();
     return ResponseEntity.ok(articles.stream().map(this::convertToDTO).toList());
 }

 // 2. API cho Weekly Top (3 bài ở giữa)
 @GetMapping("/weekly-top")
 public ResponseEntity<List<ArticleResponse>> getWeeklyTop() {
     // Trong thực tế sẽ query bài có view cao nhất tuần. Ở đây tạm lấy 3 bài tiếp theo
     List<Article> articles = articleRepository.findTop5ByOrderByCreatedAtDesc();
     return ResponseEntity.ok(articles.stream().map(this::convertToDTO).toList());
 }

 // 3. API cho Latest News (Danh sách cuộn có phân trang)
 @GetMapping("/latest")
 public ResponseEntity<Page<ArticleResponse>> getLatestNews(
         @RequestParam(defaultValue = "0", name="page") int page,
         @RequestParam(defaultValue = "10", name="size") int size) {
     
     Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
     Page<Article> articlePage = articleRepository.findAll(pageable);
     
     return ResponseEntity.ok(articlePage.map(this::convertToDTO));
 }

 // 4. API cho Sidebar: Hot News (5 bài)
 @GetMapping("/hot")
 public ResponseEntity<List<ArticleResponse>> getHotNews() {
     // Lấy 5 bài (Bạn có thể custom query order by views nếu DB có cột views)
     List<Article> articles = articleRepository.findTop5ByOrderByCreatedAtDesc();
     return ResponseEntity.ok(articles.stream().map(this::convertToDTO).toList());
 }

 // 5. API cho Trending Topics / Tags
 @GetMapping("/trending-tags")
 public ResponseEntity<List<String>> getTrendingTags() {
     return ResponseEntity.ok(List.of("AI 2026", "Chứng khoán", "Bất động sản", "Bóng đá", "Công nghệ"));
 }
}
