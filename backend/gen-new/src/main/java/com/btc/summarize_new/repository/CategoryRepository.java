package com.btc.summarize_new.repository;


import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.model.Post;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    Optional<Category> findBySlug(String slug);
    
    Optional<Category> findByName(String name);
    
    Optional<Category> findByNameIgnoreCase(String name);
    
 // Lấy tất cả và sắp xếp theo tên (hoặc bạn có thể thêm cột priority để sắp xếp)
    List<Category> findAllByOrderByNameAsc();

 // Kiểm tra slug đã tồn tại chưa (khi tạo mới)
    boolean existsBySlug(String slug);

    // Kiểm tra slug đã tồn tại chưa nhưng TRỪ id hiện tại ra (khi cập nhật)
    boolean existsBySlugAndIdNot(String slug, Integer id);
    
 // 1. Đếm tổng bài viết
    long count();

    // 2. Tính TỔNG VIEW (Cộng dồn từ JSONB)
    // Cú pháp: CAST(meta_data ->> 'views' AS INTEGER) ép kiểu text sang số để cộng
    @Query(value = "SELECT SUM(CAST(meta_data ->> 'stats' ->> 'views' AS INTEGER)) FROM posts", nativeQuery = true)
    Long sumTotalViews();

    // 3. Lấy Top 5 bài viết nhiều view nhất
    @Query(value = """
        SELECT * FROM posts 
        ORDER BY CAST(meta_data ->> 'stats' ->> 'views' AS INTEGER) DESC 
        LIMIT 5
    """, nativeQuery = true)
    List<Post> findTop5PopularPosts();
}
