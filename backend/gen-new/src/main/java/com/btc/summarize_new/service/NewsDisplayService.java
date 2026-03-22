package com.btc.summarize_new.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.blog.ArticleDTO;
import com.btc.summarize_new.dto.blog.CategoryBoxDTO;
import com.btc.summarize_new.dto.blog.HeroSectionDTO;
import com.btc.summarize_new.dto.blog.HomeOverviewResponse;
import com.btc.summarize_new.dto.blog.SourceDTO;
import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.model.Source;
import com.btc.summarize_new.repository.ArticleRepository;
import com.btc.summarize_new.utils.SlugUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class NewsDisplayService {
    private final ArticleRepository articleRepository;
    
    @Transactional(readOnly = true)
    public HomeOverviewResponse getHomeOverview() {
        log.info("Fetching home overview data...");
        
        // 1. Trending Tags
        List<String> trendingTags = List.of("#AI_TạoSinh", "#GiáVàngHômNay", "#ChứngKhoán");

        // 2. Build Hero Section
        List<Article> top5Articles = articleRepository.findTop5HeroArticles();
        log.debug("Found {} articles for Hero Section", top5Articles.size());
        HeroSectionDTO heroSection = buildHeroSection(top5Articles);

        // 3. Build Category Boxes
        List<CategoryBoxDTO> categoryBoxes = new ArrayList<>();
        categoryBoxes.add(buildCategoryBox("Thiết bị", "text-blue-700"));
        categoryBoxes.add(buildCategoryBox("Đổi mới sáng tạo", "text-green-700"));
        categoryBoxes.add(buildCategoryBox("Tin tức chung", "text-purple-700"));

        log.info("Home overview data retrieved successfully with {} categories", categoryBoxes.size());
        return new HomeOverviewResponse(trendingTags, heroSection, categoryBoxes);
    }

    @Transactional(readOnly = true)
    public Page<ArticleDTO> getNewsFeed(List<String> sources, List<String> categories, Pageable pageable) {
        log.info("Fetching news feed with filters - Sources: {}, Categories: {}, Page: {}", 
                sources, categories, pageable.getPageNumber());

        List<String> sourceList = (sources == null || sources.isEmpty()) ? null : sources;
        List<String> categoryList = (categories == null || categories.isEmpty()) ? null : categories;

        Page<Article> articlePage = articleRepository.findByFilters(sourceList, categoryList, pageable);
        
        log.debug("News feed result: {} articles found", articlePage.getTotalElements());

        return articlePage.map(this::convertToFullDTO);
    }

    private HeroSectionDTO buildHeroSection(List<Article> articles) {
        if (articles == null || articles.isEmpty()) {
            log.warn("No articles found for Hero Section");
            return new HeroSectionDTO(null, Collections.emptyList());
        }

        ArticleDTO mainArticle = convertToFullDTO(articles.get(0));
        List<ArticleDTO> subArticles = articles.stream()
                .skip(1)
                .map(this::convertToFullDTO)
                .collect(Collectors.toList());

        return new HeroSectionDTO(mainArticle, subArticles);
    }

    private CategoryBoxDTO buildCategoryBox(String categoryName, String colorClass) {
        List<Article> articles = articleRepository.findTop3ByCategoryNameOrderByPublishedAtDesc(categoryName);

        if (articles == null || articles.isEmpty()) {
            log.debug("No articles found for category: {}", categoryName);
            return new CategoryBoxDTO(categoryName, colorClass, SlugUtils.makeSlug(categoryName), null, Collections.emptyList());
        }

        ArticleDTO featuredArticle = convertToFullDTO(articles.get(0));
        List<ArticleDTO> listArticles = articles.stream()
                .skip(1)
                .map(this::convertToListDTO)
                .collect(Collectors.toList());

        return new CategoryBoxDTO(categoryName, colorClass, SlugUtils.makeSlug(categoryName), featuredArticle, listArticles);
    }

    private ArticleDTO convertToFullDTO(Article article) {
        String image = (article.getMetadata() != null && article.getMetadata().containsKey("thumb")) 
                ? article.getMetadata().get("thumb").toString() 
                : "https://via.placeholder.com/800x500";
        
        return new ArticleDTO(
                article.getId().toString(),
                article.getTitle(),
                getExcerpt(article.getRawContent(), 200),
                image,
                convertToSourceDTO(article.getSource()),
                article.getPublishedAt(),
                article.getCategory().getName(),
                article.getOriginUrl(),
                article.getNameSlug()
        );
    }

    private ArticleDTO convertToListDTO(Article article) {
        return new ArticleDTO(
                article.getId().toString(),
                article.getTitle(),
                "", 
                "", 
                convertToSourceDTO(article.getSource()),
                article.getPublishedAt(),
                article.getCategory().getName(),
                article.getOriginUrl(),
                article.getNameSlug()
        );
    }

    private SourceDTO convertToSourceDTO(Source source) {
        if (source == null) return null;
        return new SourceDTO(
                source.getName(),
                source.getSlug(),
                source.getColorClass()
        );
    }
    
    public String getExcerpt(String content, int maxLength) {
        if (content == null || content.length() <= maxLength) {
            return content;
        }
        return content.substring(0, maxLength).trim() + "...";
    }
}
