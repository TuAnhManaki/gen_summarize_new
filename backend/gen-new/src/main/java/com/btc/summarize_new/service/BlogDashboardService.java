package com.btc.summarize_new.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.btc.summarize_new.dto.BlogDashboardDTO;
import com.btc.summarize_new.model.Post;
import com.btc.summarize_new.repository.CommentRepository;
import com.btc.summarize_new.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class BlogDashboardService {
    private final PostRepository postRepo;
    private final CommentRepository commentRepo;

    public BlogDashboardDTO getDashboardStats() {
        BlogDashboardDTO dto = new BlogDashboardDTO();

        // 1. Số liệu tổng quan
        dto.setTotalPosts(postRepo.count());
        
        Long views = postRepo.sumTotalViews();
        dto.setTotalViews(views != null ? views : 0); // Handle null nếu chưa có bài nào
        
        dto.setTotalComments(commentRepo.count());
        dto.setPendingComments(0); // Tạm để 0 hoặc query theo logic duyệt của bạn

        // 2. Bài viết phổ biến
        List<Post> topPosts = postRepo.findTop5PopularPosts();
        List<BlogDashboardDTO.PostStatDTO> postStats = topPosts.stream().map(p -> {
            BlogDashboardDTO.PostStatDTO s = new BlogDashboardDTO.PostStatDTO();
            s.setTitle(p.getTitle());
            // Lấy view/like từ JSONB map qua (bạn có thể viết hàm helper trong Entity)
            s.setViews(p.getSafeViews());
            s.setLikes(p.getSafeLikes());
            return s;
        }).toList();
        dto.setPopularPosts(postStats);

        // 3. Comment mới (Mapping tương tự)
        // ... (Logic map Comment -> CommentStatDTO)

        return dto;
    }
}
