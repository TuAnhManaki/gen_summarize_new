package com.btc.summarize_new.service;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.PostCreateDTO;
import com.btc.summarize_new.dto.PostListDTO;
import com.btc.summarize_new.dto.base.PageResponse;
import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.model.Post;
import com.btc.summarize_new.model.data.PostStatus;
import com.btc.summarize_new.repository.CategoryRepository;
import com.btc.summarize_new.repository.PostRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminBlogService {

    private final PostRepository postRepository;
    private final CategoryRepository categoryRepository;

    // 1. Lấy danh sách (Search + Paging)
    public PageResponse<PostListDTO> getPosts(String keyword, Long catId, String status, int page, int size) {
//        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Pageable pageable = PageRequest.of(page, size, Sort.by("created_at").descending());
        
        Page<Post> pageResult = postRepository.searchPosts(keyword, catId, status, null, pageable);
        List<PostListDTO> responses = pageResult.getContent()
                .stream()
                .map(this::mapToListDTO)
                .toList();
        return new PageResponse<>(responses, 
				pageResult.getNumber(), 
				pageResult.getSize(), 
				pageResult.getTotalElements(),
				pageResult.getTotalPages());
	}

    // 2. Lấy chi tiết (để Edit)
    public Post getPostById(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết"));
    }

    // 3. Tạo mới
    @Transactional
    public Post createPost(PostCreateDTO dto) {
        if (postRepository.existsBySlug(dto.getSlug())) {
            throw new RuntimeException("Slug đã tồn tại, vui lòng chọn slug khác");
        }

        Post post = new Post();
        mapDtoToEntity(dto, post);
        
        return postRepository.save(post);
    }

    // 4. Cập nhật
    @Transactional
    public Post updatePost(UUID id, PostCreateDTO dto) {
        Post post = getPostById(id);
        
        // Nếu đổi slug thì phải check trùng (trừ chính nó)
        if (!post.getSlug().equals(dto.getSlug()) && postRepository.existsBySlug(dto.getSlug())) {
             throw new RuntimeException("Slug đã tồn tại");
        }

        mapDtoToEntity(dto, post);
        return postRepository.save(post);
    }

    // 5. Xóa
    public void deletePost(UUID id) {
        postRepository.deleteById(id);
    }

    // --- Helper Mapping ---
    
    private PostListDTO mapToListDTO(Post post) {
        return new PostListDTO(
            post.getId(),
            post.getTitle(),
            post.getSlug(),
            post.getCategory() != null ? post.getCategory().getName() : "Chưa phân loại",
            post.getStatus().name(),
            post.getCreatedAt(),
            post.getMetaData()
        );
    }

    private void mapDtoToEntity(PostCreateDTO dto, Post post) {
        post.setTitle(dto.getTitle());
        post.setSlug(dto.getSlug());
        post.setContent(dto.getContent());
        post.setMetaData(dto.getMetaData());
        
        // Convert String status -> Enum
        try {
            post.setStatus(PostStatus.valueOf(dto.getStatus()));
        } catch (Exception e) {
            post.setStatus(PostStatus.DRAFT);
        }

        // Set Category
        if (dto.getCategoryId() != null) {
            Category cat = categoryRepository.findById(dto.getCategoryId()).orElse(null);
            post.setCategory(cat);
        }
    }
}