package com.btc.summarize_new.service;

import java.time.LocalDateTime;
import java.util.List;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.model.Source;
import com.btc.summarize_new.repository.ArticleRepository;
import com.btc.summarize_new.repository.CategoryRepository;
import com.btc.summarize_new.repository.SourceRepository;
import com.btc.summarize_new.utils.SlugUtils;

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
    

//    @Autowired
//    private StringRedisTemplate redisTemplate;

    private static final String REDIS_URL_PREFIX = "crawled_url:";

    // =======================================================
    // 1. SCHEDULER: TỰ ĐỘNG CHẠY VÀ LẤY SOURCE TỪ DATABASE
    // =======================================================
    
    // initialDelay: Đợi 10s sau khi server khởi động xong mới chạy lần đầu
    // fixedRate: Chạy lại mỗi 15 phút (900.000 milliseconds)
//    @Scheduled(initialDelay = 10000, fixedRate = 900000)
    public void crawlAllSources() {
        log.info("=== BẮT ĐẦU CHU KỲ CRAWL TIN TỨC: {} ===", LocalDateTime.now());
        
        // Kéo toàn bộ cấu hình nguồn báo từ Database
        List<Source> sources = sourceRepository.findAll();
        
        if (sources.isEmpty()) {
            log.warn("Không tìm thấy cấu hình nguồn báo (Source) nào trong Database!");
            return;
        }

        for (Source source : sources) {
            log.info("Đang xử lý nguồn: [{}] - RSS: {}", source.getName(), source.getRssUrl());
            // Quét từng nguồn độc lập
            crawlSource(source);
        }
        
        log.info("=== KẾT THÚC CHU KỲ CRAWL ===");
    }

    // =======================================================
    // 2. LOGIC CRAWL TỪNG NGUỒN (REDIS + RSS)
    // =======================================================
    
    public void crawlSource(Source source) {
        try {
            Document rssDoc = Jsoup.connect(source.getRssUrl())
                    .userAgent("Mozilla/5.0")
                    .timeout(10000)
                    .parser(org.jsoup.parser.Parser.xmlParser())
                    .get();
            
            Elements items = rssDoc.select("item");
            int newCount = 0, skippedCount = 0;

            for (Element item : items) {
                String link = item.select("link").text();
                
//                // REDIS CACHE: Check trùng lặp với O(1) - Lưu key 30 ngày
//                Boolean isNewLink = redisTemplate.opsForValue()
//                        .setIfAbsent(REDIS_URL_PREFIX + link, "1", Duration.ofDays(30));
//                
//                if (Boolean.FALSE.equals(isNewLink)) {
//                    skippedCount++;
//                    continue; // Link đã tồn tại, bỏ qua ngay lập tức
//                }

                // Khởi tạo Article
                Article article = new Article();
                article.setSource(source);
                article.setTitle(item.select("title").text());
                article.setOriginUrl(link);
                article.setViews(0);
                article.setNameSlug(SlugUtils.makeSlug(article.getTitle()));

                // GỌI JSOUP ĐỂ CÀO CHI TIẾT VÀ BREADCRUMB
                boolean success = extractDetailAndBreadcrumb(link, source.getSelector(), article);
                
                if (success) {
                    // CHỐT CHẶN DATABASE (ON CONFLICT DO NOTHING)
                    int rowsAffected = articleRepository.insertIgnoreConflict(article);
                    
                    if (rowsAffected > 0) {
                        newCount++;
                        log.debug("Đã lưu bài mới: {}", article.getTitle());
                    } else {
                        skippedCount++;
                        log.debug("Trùng URL trong Database, bỏ qua: {}", link);
                    }
                } else {
                    // Cào lỗi (Web sập/Đổi layout) -> Xóa Redis Key để chu kỳ sau cào lại
//                    redisTemplate.delete(REDIS_URL_PREFIX + link);
                }
            }
            log.info("Hoàn tất nguồn [{}]: Thêm mới [{}] | Bỏ qua trùng lặp [{}]", source.getName(), newCount, skippedCount);

        } catch (Exception e) {
            log.error("Lỗi cào RSS nguồn {}: {}", source.getName(), e.getMessage());
        }
    }

    // =======================================================
    // 3. LOGIC BÓC TÁCH HTML CHI TIẾT & BREADCRUMB CATEGORY
    // =======================================================

    private boolean extractDetailAndBreadcrumb(String url, String selector, Article article) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
                    .timeout(15000)
                    .get();
            
            // Lấy nội dung thô (HTML)
            Elements body = doc.select(selector);
            if (body.isEmpty()) return false;
            article.setRawContent(body.select("p").text());

            // CHIẾN LƯỢC 1: Bắt Category từ Breadcrumb
            String categoryName = "Tin tức chung"; 
            if (url.contains("vnexpress.net")) {
                Element bc = doc.selectFirst("ul.breadcrumb li:nth-last-child(2) a, ul.breadcrumb li:nth-child(2) a");
                if (bc != null) categoryName = bc.text().trim();
            } else if (url.contains("genk.vn")) {
                Element bc = doc.selectFirst(".kbwcb-breadcrum li:nth-child(2) a");
                if (bc != null) categoryName = bc.text().trim();
            } else if (url.contains("tuoitre.vn")) {
                Element bc = doc.selectFirst(".detail-breadcrumb li:nth-child(2) a");
                if (bc != null) categoryName = bc.text().trim();
            }
            article.setCategory(getOrCreateCategory(categoryName));

            // Lấy Thumbnail chất lượng cao từ thẻ Meta
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

            
            // Lấy Tác giả
            Element authorMeta = doc.selectFirst("meta[name=author], meta[property=article:author]");
            article.setAuthor(authorMeta != null ? authorMeta.attr("content") : "Tổng hợp");
            
            // Lấy Thời gian xuất bản (ưu tiên thẻ meta ISO-8601, nếu không có lấy giờ hiện tại)
            Element timeMeta = doc.selectFirst("meta[property=article:published_time]");
            if (timeMeta != null) {
                try {
                    article.setPublishedAt(LocalDateTime.parse(timeMeta.attr("content"), java.time.format.DateTimeFormatter.ISO_OFFSET_DATE_TIME));
                } catch (Exception e) {
                    article.setPublishedAt(LocalDateTime.now());
                }
            } else {
                article.setPublishedAt(LocalDateTime.now()); 
            }

            return true;
        } catch (Exception e) {
            log.warn("Lỗi bóc tách nội dung HTML URL {}: {}", url, e.getMessage());
            return false;
        }
    }

    private Category getOrCreateCategory(String name) {
        return categoryRepository.findByNameIgnoreCase(name).orElseGet(() -> {
            Category cat = new Category();
            cat.setName(name);
            cat.setSlug(SlugUtils.makeSlug(name)); // Tạo slug đơn giản
            return categoryRepository.save(cat);
        });
    }
}