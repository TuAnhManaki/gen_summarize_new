package com.btc.summarize_new.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.blog.NewsDto.ArticleDetail;
import com.btc.summarize_new.dto.blog.NewsDto.ArticleItem;
import com.btc.summarize_new.dto.blog.NewsDto.SummaryResponse;
import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.repository.ArticleRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsDetailService {

    private final ArticleRepository articleRepository;
    
    private final SummarizationTask summarizationTask;

    @Transactional
    public ArticleDetail getArticleDetail(String slug) {
        Article article = articleRepository.findByNameSlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết!"));

        // Tăng lượt view mỗi lần user truy cập
        article.setViews(article.getViews() + 1);
        articleRepository.save(article);

        // Map sang DTO
        return new ArticleDetail(
                article.getId(),
                article.getTitle(),
                article.getCategory() != null ? article.getCategory().getName() : "Khác",
                article.getSource() != null ? article.getSource().getName() : "Nguồn ẩn",
                article.getAuthor(),
                article.getPublishedAt(),
                article.getRawContent(),
                article.getOriginUrl(),
                article.getSummaryContent(),
                article.getMetadata()
        );
    }

    @Transactional(readOnly = true)
    public List<ArticleItem> getRelatedNews(String id) {
        Article currentArticle = articleRepository.findByNameSlug(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết!"));

        int categoryId = currentArticle.getCategory() != null ? currentArticle.getCategory().getId() : 0;

        return articleRepository.findTop4ByCategoryIdAndNameSlugNotOrderByPublishedAtDesc(categoryId, id)
                .stream()
                .map(a -> {
                    // Trích xuất link ảnh từ metadata (giả sử key là "thumb")
                    String thumb = a.getMetadata() != null && a.getMetadata().containsKey("thumb") 
                                 ? a.getMetadata().get("thumb").toString() 
                                 : "link_anh_mac_dinh.jpg";
                    
                    return new ArticleItem(
                            a.getId(),
                            a.getTitle(),
                            thumb,
                            a.getSource() != null ? a.getSource().getName() : "",
                            a.getPublishedAt(),
                            a.getNameSlug()
                    );
                })
                .collect(Collectors.toList());
    }

    
    public SummaryResponse summarizeArticle(Long id) {
    	
    	 String aiResult = summarizationTask.manualSummarizToText(id);
       
        return new SummaryResponse(aiResult);
    }
}