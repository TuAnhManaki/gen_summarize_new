package com.btc.summarize_new.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.btc.summarize_new.model.Post;

public interface PostRepository extends JpaRepository<Post, UUID> {
	
	// Native Query PostgreSQL mạnh mẽ
    // COALESCE để xử lý null (nếu param truyền vào null thì bỏ qua điều kiện đó)
    @Query(value = """
        SELECT * FROM posts p
        WHERE 
            (:keyword IS NULL OR p.title ILIKE CONCAT('%', :keyword, '%'))
        AND 
            (:categoryId IS NULL OR p.category_id = :categoryId)
        AND 
            (:status IS NULL OR p.status = :status)
        AND 
    		(:tag IS NULL OR jsonb_exists(p.meta_data -> 'tags', :tag))
        """, 
        countQuery = """
        SELECT count(*) FROM posts p
        WHERE 
            (:keyword IS NULL OR p.title ILIKE CONCAT('%', :keyword, '%'))
        AND 
            (:categoryId IS NULL OR p.category_id = :categoryId)
        AND 
            (:status IS NULL OR p.status = :status)
        AND 
        	(:tag IS NULL OR jsonb_exists(p.meta_data -> 'tags', :tag))
        """,
        nativeQuery = true)
    Page<Post> searchPosts(
        @Param("keyword") String keyword,
        @Param("categoryId") Long categoryId,
        @Param("status") String status,
        @Param("tag") String tag,
        Pageable pageable
    );
    
    // Check slug tồn tại để validate
    boolean existsBySlug(String slug);
    
 // 1. Đếm tổng bài viết
    long count();

    // 2. Tính TỔNG VIEW (Cộng dồn từ JSONB)
    // Cú pháp: CAST(meta_data ->> 'views' AS INTEGER) ép kiểu text sang số để cộng
    @Query(value = """
    	    SELECT SUM(
    	        CAST(jsonb_extract_path_text(p.meta_data, 'stats', 'views') AS INTEGER)
    	    )
    	    FROM posts p
    	""", nativeQuery = true)
    	Long sumTotalViews();

    // 3. Lấy Top 5 bài viết nhiều view nhất
    @Query(value = """
    	    SELECT * FROM posts 
    	    ORDER BY CAST(jsonb_extract_path_text(meta_data, 'stats', 'views') AS INTEGER) DESC 
    	    LIMIT 5
    	""", nativeQuery = true)
    	List<Post> findTop5PopularPosts();
    
    
 // 1. JPQL: Dùng tên Class (Post) và tên thuộc tính (createdAt, status)
    // Hibernate tự map sang bảng 'posts'
    @Query("SELECT p FROM Post p WHERE p.status = 'PUBLISHED' ORDER BY p.createdAt DESC")
    Page<Post> findLatestPublished(Pageable pageable);

    // 2. NATIVE QUERY: Phải dùng tên BẢNG thực tế ('posts') và tên CỘT thực tế ('meta_data', 'created_at')
    // Lưu ý: cast(p.meta_data...) dùng dấu gạch dưới vì đây là tên cột trong DB
    @Query(value = """
        SELECT * FROM posts p 
        WHERE p.status = 'PUBLISHED' 
        AND p.created_at >= :startDate
        ORDER BY cast(p.meta_data -> 'stats' ->> 'views' as integer) DESC
        """, nativeQuery = true)
    List<Post> findTopViewedPosts(@Param("startDate") LocalDateTime startDate, Pageable pageable);

    // 3. NATIVE QUERY: Trending Tags
    // Sửa 'post' thành 'posts' và 'p.meta_data'
    @Query(value = """
        SELECT tag 
        FROM posts p, jsonb_array_elements_text(p.meta_data -> 'tags') as tag 
        WHERE p.status = 'PUBLISHED'
        GROUP BY tag 
        ORDER BY count(*) DESC
        """, nativeQuery = true)
    List<String> findTrendingTags(Pageable pageable);
}
