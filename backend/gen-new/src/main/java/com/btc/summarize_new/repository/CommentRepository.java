package com.btc.summarize_new.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.btc.summarize_new.model.Comment;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    long count();
    
    // Giả sử có cột status
    // long countByStatus(String status); 
    
    // Lấy 5 comment mới nhất
    List<Comment> findTop5ByOrderByCreatedAtDesc();
    
 // 1. Tìm comment theo bài viết (Cơ bản)
    List<Comment> findByPostId(UUID postId);

    // 2. Tìm tất cả comment được viết từ thiết bị cụ thể (Ví dụ: "iPhone")
    // Sử dụng toán tử ->> của Postgres để lấy giá trị text từ JSON
    @Query(value = "SELECT * FROM comments c WHERE c.properties ->> 'device_info' LIKE %:device%", nativeQuery = true)
    List<Comment> findByDevice(@Param("device") String deviceName);

    // 3. Tìm các comment đã bị chỉnh sửa (is_edited = true)
    // Lưu ý: trong JSONB true/false vẫn cần ép kiểu hoặc so sánh chuỗi tùy phiên bản Postgres, 
    // nhưng cách an toàn nhất là so sánh text 'true'
    @Query(value = "SELECT * FROM comments c WHERE c.properties ->> 'is_edited' = 'true'", nativeQuery = true)
    List<Comment> findEditedComments();

    // 4. Update nhanh số lượng like (Tăng hiệu năng, không cần load Entity lên)
    // Dùng jsonb_set để update trường likes_count
    @Modifying
    @Query(value = """
        UPDATE comments 
        SET properties = jsonb_set(
            properties, 
            '{likes_count}', 
            (COALESCE(properties->>'likes_count','0')::int + 1)::text::jsonb
        ) 
        WHERE id = :commentId
    """, nativeQuery = true)
    void incrementLikeCount(@Param("commentId") Long commentId);
}
