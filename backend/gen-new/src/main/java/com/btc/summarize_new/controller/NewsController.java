package com.btc.summarize_new.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.btc.summarize_new.dto.ArticleDetailResponse;
import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.repository.ArticleRepository;
import com.btc.summarize_new.service.NewsCrawlerService;
import com.btc.summarize_new.service.SummarizationTask;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

import lombok.extern.slf4j.Slf4j;


@RestController
@RequestMapping("/api/news")
@Slf4j
@CrossOrigin(origins = "*")
public class NewsController {

    @Autowired
    private NewsCrawlerService crawlerService;

    @Autowired
    private SummarizationTask summarizationTask;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ObjectMapper objectMapper;
    
    /**
     * Lấy chi tiết một bài báo theo ID
     */
    @GetMapping("/articles/{id}")
    public ResponseEntity<ArticleDetailResponse> getArticleDetail(@PathVariable("id") Long id) {
        Optional<Article> articleOpt = articleRepository.findById(id);

        if (articleOpt.isPresent()) {
            Article article = articleOpt.get();
            return ResponseEntity.ok(convertToDetailDTO(article));
        }
        
        return ResponseEntity.notFound().build(); // Trả về lỗi 404 nếu ID không tồn tại
    }

    /**
     * Hàm helper: Chuyển đổi từ Entity Article sang DTO ArticleDetailResponse
     */
    private ArticleDetailResponse convertToDetailDTO(Article article) {
        ArticleDetailResponse dto = new ArticleDetailResponse();
        
        dto.setId(article.getId());
        dto.setTitle(article.getTitle());
        dto.setCategory(article.getCategory() != null ? article.getCategory().getName() : "Chưa phân loại");
        dto.setAuthor(article.getAuthor() != null ? article.getAuthor() : "Nặc danh");
        dto.setDate(article.getPublishedAt() != null ? article.getPublishedAt().toString() : "");
        dto.setViews(article.getViews() != null ? article.getViews() : 0);
        
        // Tạm thời hardcode comment là 0, sau này có bảng Comment thì count() từ DB
        dto.setCommentsCount(0); 
        
        dto.setRawContent(article.getRawContent());
        dto.setSummaryContent(article.getSummaryContent());
        dto.setIsSummarized(article.getIsSummarized() != null ? article.getIsSummarized() : false);

        // Bóc tách Dữ liệu JSONB (metadata)
        Map<String, Object> metadata = article.getMetadata();
        if (metadata != null) {
            // Lấy ảnh Thumbnail
            dto.setImage(metadata.containsKey("thumb") ? metadata.get("thumb").toString() : "https://via.placeholder.com/800x500");
            
            // Lấy danh sách Tags một cách an toàn
            if (metadata.containsKey("tags")) {
                try {
                    // Convert Object list an toàn sang List<String>
                    List<String> tags = objectMapper.convertValue(metadata.get("tags"), new TypeReference<List<String>>() {});
                    dto.setTags(tags);
                } catch (Exception e) {
                    dto.setTags(new ArrayList<>());
                }
            } else {
                dto.setTags(new ArrayList<>());
            }
        } else {
            dto.setImage("https://via.placeholder.com/800x500");
            dto.setTags(new ArrayList<>());
        }

        return dto;
    }

    /**
     * Lấy danh sách tin tức (Mới nhất lên đầu)
     */
    @GetMapping("/articles")
    public ResponseEntity<List<Article>> getAllArticles() {
        return ResponseEntity.ok(articleRepository.findAll(
                Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    /**
     * Kích hoạt Crawl tin tức thủ công
     */
    @PostMapping("/crawl")
    public ResponseEntity<String> triggerCrawl() {
        log.info("Yêu cầu Crawl thủ công từ API");
        crawlerService.crawlAllSources();
        return ResponseEntity.ok("Đã bắt đầu quét tin mới, hãy kiểm tra Log...");
    }

    /**
     * Tóm tắt toàn bộ các bài còn tồn đọng (Pending)
     */
    @PostMapping("/summarize-all")
    public ResponseEntity<String> triggerSummarizeAll() {
        log.info("Yêu cầu tóm tắt toàn bộ tin mới từ API");
        summarizationTask.autoSummarizeLatestNews();
        return ResponseEntity.ok("Đang tiến hành tóm tắt, vui lòng đợi...");
    }

    /**
     * Tóm tắt riêng một bài báo cụ thể theo ID
     */
    @PostMapping("/{id}/summarize")
    public ResponseEntity<String> summarizeOne(@PathVariable("id")  Long id) {
        boolean success = summarizationTask.manualSummarize(id);
        if (success) {
            return ResponseEntity.ok("Đã tóm tắt thành công bài báo ID: " + id);
        }
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body("Tóm tắt thất bại. Kiểm tra Log để biết chi tiết.");
    }
    
    @PutMapping("/{id}/view")
    public ResponseEntity<Void> incrementView(@PathVariable("id")  Long id) {
        articleRepository.findById(id).ifPresent(article -> {
            article.setViews(article.getViews() + 1);
            articleRepository.save(article);
        });
        return ResponseEntity.ok().build();
    }
}