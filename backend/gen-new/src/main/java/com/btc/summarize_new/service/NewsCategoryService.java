package com.btc.summarize_new.service;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.blog.CategoryDto.ArticleItem;
import com.btc.summarize_new.dto.blog.CategoryDto.CategoryPageResponse;
import com.btc.summarize_new.dto.blog.CategoryDto.PageData;
import com.btc.summarize_new.dto.blog.CategoryDto.SourceDto;
import com.btc.summarize_new.dto.blog.CategoryDto.SourceFilterDto;
import com.btc.summarize_new.model.Article;
import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.repository.ArticleRepository;
import com.btc.summarize_new.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NewsCategoryService {

    private final CategoryRepository categoryRepository;
    private final ArticleRepository articleRepository;

    @Transactional(readOnly = true)
    public CategoryPageResponse getCategoryPageData(String slug) {
        
        Category category = categoryRepository.findBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy chuyên mục"));

        // 1. LẤY HERO SECTION (5 bài mới nhất)
        List<Article> top5Latest = articleRepository.findTop5ByCategorySlugOrderByPublishedAtDesc(slug);
        List<Long> heroArticleIds = top5Latest.stream().map(Article::getId).toList();

        ArticleItem heroMain = null;
        List<ArticleItem> col1 = new ArrayList<>();
        List<ArticleItem> col2 = new ArrayList<>();

        // Logic chia bài viết vào các cột an toàn (tránh lỗi IndexOutOfBounds nếu chuyên mục ít hơn 5 bài)
        if (!top5Latest.isEmpty()) {
            heroMain = mapToItem(top5Latest.get(0));
            if (top5Latest.size() > 1) col1.add(mapToItem(top5Latest.get(1)));
            if (top5Latest.size() > 2) col1.add(mapToItem(top5Latest.get(2)));
            if (top5Latest.size() > 3) col2.add(mapToItem(top5Latest.get(3)));
            if (top5Latest.size() > 4) col2.add(mapToItem(top5Latest.get(4)));
        }

        // 2. LẤY BÀI VIẾT PHÂN TRANG (Loại trừ các bài đã nằm ở Hero)
        // Spring Data Page bắt đầu từ 0, Angular truyền lên từ 1
//        PageRequest pageRequest = PageRequest.of(page - 1, size);
//        
//        // Nếu không có bài ở Hero, ta truyền id giả -1 để câu SQL IN không bị lỗi cú pháp
//        List<Long> excludeIds = heroArticleIds.isEmpty() ? List.of(-1L) : heroArticleIds;
//        
//        // Cú pháp cấp null nếu list rỗng để bỏ qua điều kiện lọc source
//        List<String> validSources = (sourceSlugs == null || sourceSlugs.isEmpty()) ? null : sourceSlugs;
//
//        Page<Article> feedPage = articleRepository.findFeedArticles(categoryId, excludeIds, validSources, pageRequest);
//        Page<ArticleItem> feedDtoPage = feedPage.map(this::mapToItem);

        // 3. LẤY SIDEBAR (Bài đọc nhiều)
        List<ArticleItem> popular = articleRepository.findTop3ByCategorySlugOrderByViewsDesc(slug)
                .stream().map(this::mapToItem).toList();

        // 4. LẤY DANH SÁCH BỘ LỌC (Có thể fix cứng hoặc query từ DB Source)
        List<SourceFilterDto> filters = List.of(
                new SourceFilterDto("vnexpress", "VnExpress", true, "text-red-600 focus:ring-red-500"),
                new SourceFilterDto("genk", "GenK", true, "text-green-600 focus:ring-green-500"),
                new SourceFilterDto("zing", "Zing News Công Nghệ", true, "text-blue-600 focus:ring-blue-500")
        );

        return new CategoryPageResponse(
                category.getName(),
                category.getDescription(),
                heroMain,
                col1,
                col2,
                popular,
                filters
        );
    }

    // Hàm phụ: Map Entity -> DTO chung
    private ArticleItem mapToItem(Article a) {
        String thumb = a.getMetadata() != null && a.getMetadata().containsKey("thumb")
                ? a.getMetadata().get("thumb").toString()
                : "https://via.placeholder.com/600"; // Ảnh mặc định

        SourceDto sourceDto = a.getSource() != null 
                ? new SourceDto(a.getSource().getName(), a.getSource().getSlug(), "text-gray-800", "bg-gray-200") 
                : new SourceDto("Khác", "other", "text-gray-800", "bg-gray-200");

        // Cắt ngắn Excerpt để không bị nặng payload
        String excerpt = a.getRawContent() != null && a.getRawContent().length() > 150 
                ? a.getRawContent().substring(0, 150) + "..." 
                : a.getRawContent();

        return new ArticleItem(
                a.getId(),
                a.getTitle(),
                excerpt,
                thumb,
                sourceDto,
                a.getPublishedAt(),
                a.getViews(),
                a.getNameSlug()
        );
    }
}