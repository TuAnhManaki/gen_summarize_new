package com.btc.summarize_new.service;

//Java Standard Lib
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
//Spring Framework
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.model.Source;
import com.btc.summarize_new.repository.ArticleRepository;
import com.btc.summarize_new.repository.CategoryRepository;
import com.btc.summarize_new.repository.SourceRepository;
import com.btc.summarize_new.utils.DateUtils;
import com.btc.summarize_new.utils.StringUtils;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class NewsCrawlerService {

    @Autowired
    private ArticleRepository articleRepository;
    
    @Autowired
    private SourceRepository sourceRepository;

    @Autowired
    private CategoryRepository categoryRepository;

   
//    @Scheduled(initialDelay = 10000, fixedRate = 900000) // 15 phút
    public void crawlAllSources() {
        log.info("=== BẮT ĐẦU CHU KỲ CRAWL TIN TỨC: {} ===", LocalDateTime.now());
        System.out.println("CRAWL TIN TỨC");
        List<Source> sources = sourceRepository.findAll();
        if (sources.isEmpty()) {
        	
            log.warn("Không tìm thấy nguồn báo (Source) nào trong Database!");
            return;
        }

        for (Source source : sources) {
            log.info("Đang xử lý nguồn: [{}] - URL: {}", source.getName(), source.getRssUrl());
            try {
                crawlSource(source);
            } catch (Exception e) {
                log.error("Lỗi nghiêm trọng khi crawl nguồn {}: {}", source.getName(), e.getMessage());
            }
        }
        
        log.info("=== KẾT THÚC CHU KỲ CRAWL ===");
    }

    public void crawlSource(Source source) {
        try {
            Document rssDoc = Jsoup.connect(source.getRssUrl())
                    .timeout(10000)
                    .parser(org.jsoup.parser.Parser.xmlParser()) // Ép kiểu parse XML cho RSS
                    .get();
            
            Elements items = rssDoc.select("item");
            log.info("Tìm thấy {} bài viết từ RSS của {}", items.size(), source.getName());

            int newArticlesCount = 0;
            int skippedCount = 0;

            for (Element item : items) {
                String link = item.select("link").text();
                
                // 1. Kiểm tra trùng lặp
                if (articleRepository.existsByOriginUrl(link)) {
                    skippedCount++;
                    continue;
                }

                String title = item.select("title").text();
                
                // 2. Bóc tách nội dung chi tiết
                String fullContent = extractMainContent(link, source.getSelector());
                String pubDateStr = item.select("pubDate").text();
                LocalDateTime publishedAt = DateUtils.parseRssDate(pubDateStr);
                
                if (fullContent != null && !fullContent.isEmpty()) {
                    Article article = new Article();
                    article.setSource(source);
                    article.setTitle(title);
                    article.setOriginUrl(link);
                    article.setRawContent(fullContent);
                    
                    article.setPublishedAt(publishedAt != null ? publishedAt : LocalDateTime.now());
                    
                 // 1. TỰ ĐỘNG THÊM HOẶC LẤY CATEGORY TỪ RSS
                    String categoryName = item.select("category").first() != null 
                                          ? item.select("category").first().text() 
                                          : "Tin tức chung";
                    article.setCategory(getOrCreateCategory(categoryName));

                    // 2. BÓC TÁCH NỘI DUNG, TÁC GIẢ TỪ HTML GỐC
                    extractDetailInfo(link, source.getSelector(), article);
                    
                    if (article.getRawContent() != null && !article.getRawContent().isEmpty()) {
                        // Khởi tạo views mặc định
                        article.setViews(0);
                        articleRepository.save(article);
                        log.info("Đã lưu bài: {} | Chuyên mục: {}", article.getTitle(), categoryName);
                    }
                    // Metadata: Ảnh đại diện
                    String thumb = extractThumbnail(item);
                    article.getMetadata().put("thumb", thumb);
                    
                    articleRepository.save(article);
                    newArticlesCount++;
                    log.debug("Đã lưu bài mới: {}", title); // Dùng debug để tránh loãng log info
                } else {
                    log.warn("Không thể lấy nội dung cho bài: {} (Link: {})", title, link);
                }
            }
            log.info("Hoàn tất {}: Thêm mới [{}], Bỏ qua [{}] bài cũ.", 
                    source.getName(), newArticlesCount, skippedCount);

        } catch (IOException e) {
            log.error("Lỗi kết nối RSS đến {}: {}", source.getName(), e.getMessage());
        }
    }

    private String extractMainContent(String url, String selector) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0")
                    .timeout(15000)
                    .get();
            
            Elements body = doc.select(selector);
            if (body.isEmpty()) {
                log.warn("Không tìm thấy Selector '{}' tại URL: {}", selector, url);
                return null;
            }
            return body.select("p").text(); 
        } catch (Exception e) {
            log.warn("Lỗi khi bóc tách bài viết tại {}: {}", url, e.getMessage());
            return null;
        }
    }

    private String extractThumbnail(Element rssItem) {
        try {
            String description = rssItem.select("description").text();
            Document descDoc = Jsoup.parse(description);
            return descDoc.select("img").attr("src");
        } catch (Exception e) {
            return "";
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

    /**
     * Bóc tách chi tiết: Nội dung, Tác giả, và Metadata khác
     */
    private void extractDetailInfo(String url, String selector, Article article) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64)")
                    .timeout(10000)
                    .get();
            
            // Lấy nội dung
            Elements body = doc.select(selector);
            article.setRawContent(body.select("p").text());

            // Lấy Tác giả (Author) - Các báo thường dùng thẻ meta này
            Element authorMeta = doc.selectFirst("meta[name=author], meta[property=article:author]");
            if (authorMeta != null) {
                article.setAuthor(authorMeta.attr("content"));
            } else {
                // Nếu không có thẻ meta, thử tìm class phổ biến chứa tên tác giả (tùy báo)
                Element authorTag = doc.selectFirst(".author_name, .author, .nguoi-viet");
                article.setAuthor(authorTag != null ? authorTag.text() : "Nặc danh");
            }

            // Lấy ảnh đại diện nét (og:image)
            Element imageMeta = doc.selectFirst("meta[property=og:image]");
            if (imageMeta != null) {
                article.getMetadata().put("thumb", imageMeta.attr("content"));
            }
            
            // Lấy Keywords/Tags để phục vụ mục Trending Tags sau này
            Element keywordsMeta = doc.selectFirst("meta[name=keywords]");
            if (keywordsMeta != null) {
                String[] tags = keywordsMeta.attr("content").split(",");
                article.getMetadata().put("tags", tags);
            }

        } catch (Exception e) {
            log.warn("Lỗi khi bóc tách chi tiết URL {}: {}", url, e.getMessage());
        }
    }
}