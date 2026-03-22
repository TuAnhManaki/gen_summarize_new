package com.btc.summarize_new.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.btc.summarize_new.dto.AISummaryDTO;
import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.repository.ArticleRepository;
import com.btc.summarize_new.repository.CategoryRepository;
import com.btc.summarize_new.utils.StringUtils;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class SummarizationTask {

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private AIGptService openAIService;
    
    @Autowired
    private GeminiService geminiService;

    @Autowired
    private CategoryRepository categoryRepository;

    /**
     * TỰ ĐỘNG: Quét và tóm tắt tin mới nhất định kỳ
     */
//    @Scheduled(fixedRate = 300000) // 5 phút một lần
    public void autoSummarizeLatestNews() {
        log.info("Đang quét các bài báo mới nhất để tóm tắt...");
        
        // Chỉ định: Lấy 10 bài mới nhất chưa có tóm tắt
        List<Article> pendingArticles = articleRepository.findTop1ByIsSummarizedFalseOrderByCreatedAtDesc();

        if (pendingArticles.isEmpty()) {
            log.info("Không có bài báo nào đợi tóm tắt.");
            return;
        }

        pendingArticles.forEach(this::processSingleArticle);
    }

    /**
     * THỦ CÔNG: Hàm này dùng để gọi từ Controller khi bạn muốn tóm tắt 1 bài cụ thể
     */
    public boolean manualSummarize(Long articleId) {
        return articleRepository.findById(articleId).map(article -> {
            if (article.getIsSummarized()) return true; // Đã tóm tắt rồi
            return processSingleArticle(article);
        }).orElse(false);
    }
    
    public String manualSummarizToText(Long articleId) {
        return articleRepository.findById(articleId).map(article -> {
            // 1. Kiểm tra nếu đã tóm tắt rồi
            if (Boolean.TRUE.equals(article.getIsSummarized())) {
                log.info("Bài viết '{}' đã được tóm tắt trước đó.", article.getTitle());
                return article.getSummaryContent(); 
            }
            
            try {
                log.info("Đang gửi bài '{}' sang gemini-2.5-flash...", article.getTitle());
                String summary = geminiService.summarize(article.getRawContent());

                if (summary != null && !summary.isBlank()) {
                    article.setIsSummarized(true);
                    article.setAiModelUsed("gemini-2.5-flash");
                    // Cập nhật nội dung tóm tắt vào object article
                    updateArticleWithAI(article, summary.trim());
                    // Lưu vào database
                 // 1. Làm sạch chuỗi (Đôi khi AI trả về kèm dấu ```json ... ```)
                    String cleanJson = summary.trim().replaceAll("```json", "").replaceAll("```", "").trim();

                    // 2. Parse JSON String sang Object
                    AISummaryDTO dto = objectMapper.readValue(cleanJson, AISummaryDTO.class);

                    articleRepository.save(article); 
                    return dto.getSummary();
                }
            } catch (Exception e) {
                log.error("Lỗi khi xử lý bài {}: {}", articleId, e.getMessage());
            }
            return null; // Trả về null nếu có lỗi hoặc tóm tắt trống
            
        }).orElse(null); // Trả về null nếu không tìm thấy articleId
    }


    private boolean processSingleArticle(Article article) {
        try {
            log.info("Đang gửi bài '{}' sang gemini-2.5-flash...", article.getTitle());
//          String summary = openAIService.summarize(article.getRawContent());
          String summary = geminiService.summarize(article.getRawContent());

            if (summary != null && !summary.isEmpty()) {
                article.setIsSummarized(true);
                article.setAiModelUsed("gemini-2.5-flash");
                updateArticleWithAI(article, summary.trim());
                return true;
            }
        } catch (Exception e) {
            log.error("Lỗi khi xử lý bài {}: {}", article.getId(), e.getMessage());
        }
        return false;
    }
    
    @Autowired
    private ObjectMapper objectMapper;

    public void updateArticleWithAI(Article article, String aiJsonResponse) {
        try {
            // 1. Làm sạch chuỗi (Đôi khi AI trả về kèm dấu ```json ... ```)
            String cleanJson = aiJsonResponse.replaceAll("```json", "").replaceAll("```", "").trim();

            // 2. Parse JSON String sang Object
            AISummaryDTO dto = objectMapper.readValue(cleanJson, AISummaryDTO.class);

            // 3. Cập nhật Article
            article.setSummaryContent(dto.getSummary()); // Lưu nội dung tóm tắt
            article.setCategory(getOrCreateCategory(dto.getCategory())); // Tự động tạo/gán category
            article.setIsSummarized(true);
            
            articleRepository.save(article);
        } catch (Exception e) {
            log.error("Lỗi parse JSON từ AI: {}", e.getMessage());
        }
    }
    
    /**
     * Hàm tự động tạo Category nếu chưa tồn tại
     */
    private Category getOrCreateCategory(String name) {
        String finalName = name.trim();
        return categoryRepository.findByNameIgnoreCase(finalName).orElseGet(() -> {
            Category newCategory = new Category();
            newCategory.setName(finalName);
            newCategory.setSlug(StringUtils.toSlug(finalName));
            log.info("Tạo mới chuyên mục: {}", finalName);
            return categoryRepository.save(newCategory);
        });
    }
}