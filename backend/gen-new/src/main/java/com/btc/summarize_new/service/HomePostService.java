
package com.btc.summarize_new.service;

import java.time.LocalDateTime;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import com.btc.summarize_new.dto.HomePostDTO;
import com.btc.summarize_new.dto.HomePostResponseDTO;
import com.btc.summarize_new.dto.HomePostSidebarDTO;
import com.btc.summarize_new.dto.base.PageResponse;
import com.btc.summarize_new.model.Post;
import com.btc.summarize_new.model.data.PostMeta;
import com.btc.summarize_new.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HomePostService {

    private final PostRepository postRepository;

    public HomePostResponseDTO getHomeData(int page, int size) {
    	HomePostResponseDTO response = new HomePostResponseDTO();

        // 1. Trending Topics (Giả sử fix cứng hoặc lấy từ config/bảng khác)
        response.setTrendingTopics(Arrays.asList("English Tips", "IELTS Speaking", "Vocabulary Hacks"));

        // 2. Featured Posts: Lấy 3 bài mới nhất làm Featured
        // (Hoặc nếu bạn có flag isFeatured trong metadata thì query theo flag đó)
        Page<Post> latestPage = postRepository.findLatestPublished(PageRequest.of(0, 3));
        response.setFeaturedPosts(latestPage.getContent().stream().map(this::toHomePostDTO).toList());

        // 3. Weekly Top: Top views trong 7 ngày qua
        List<Post> weekly = postRepository.findTopViewedPosts(
                LocalDateTime.now().minusDays(7), 
                PageRequest.of(0, 3)
        );
        response.setWeeklyTop(weekly.stream().map(this::toHomePostDTO).toList());

        // 4. Latest News: Phân trang (tránh lấy trùng 3 bài Featured nếu muốn kỹ hơn thì skip 3 bài đầu)
        response.setLatestNews(getLatestPosts(0, 10));

        // 5. Sidebar (Hot News + Tags)
        HomePostSidebarDTO sidebar = new HomePostSidebarDTO();
        
        // Hot News: Top views trong 30 ngày qua
        List<Post> hotNews = postRepository.findTopViewedPosts(
                LocalDateTime.now().minusDays(30), 
                PageRequest.of(0, 5) // Lấy top 5
        );
        sidebar.setHotNews(hotNews.stream().map(this::toHomePostDTO).toList());

        // Trending Tags: Top 10 tags
        List<String> tags = postRepository.findTrendingTags(PageRequest.of(0, 10));
        sidebar.setTrendingTags(tags);
        
        response.setSidebar(sidebar);

        return response;
    }
    
    public PageResponse<HomePostDTO> getLatestPosts(int page, int size) {
    	
        Page<Post> postPage = postRepository.findLatestPublished(PageRequest.of(page, size));
        Page<HomePostDTO> dtoPage = postPage.map(this::toHomePostDTO);
         return new PageResponse<>(dtoPage.getContent(), 
        		dtoPage.getNumber(), 
        		dtoPage.getSize(), 
        		dtoPage.getTotalElements(),
        		dtoPage.getTotalPages());
    }

    // Mapper Utility: Chuyển Entity -> DTO
    private HomePostDTO toHomePostDTO(Post post) {
        PostMeta meta = post.getMetaData();
        PostMeta.PostStats stats = (meta != null) ? meta.getStats() : new PostMeta.PostStats();
        
        // Format ngày tháng đẹp
        String dateStr = post.getCreatedAt() != null 
            ? post.getCreatedAt().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")) 
            : "";

        return HomePostDTO.builder()
                .id(post.getId())
                .title(post.getTitle())
                .slug(post.getSlug())
                .categoryName(post.getCategory() != null ? post.getCategory().getName() : "Uncategorized")
                .date(dateStr)
                .image(meta != null ? meta.getThumbnail() : "https://placehold.co/600x400")
                .excerpt(meta != null ? meta.getSummary() : "")
                .views(stats.getViews())
                .build();
    }
}
