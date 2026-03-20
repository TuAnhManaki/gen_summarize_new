package com.btc.summarize_new.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import com.btc.summarize_new.model.data.CommentProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "comments"
//,
//indexes = {
//        // Index cho post_id: Tìm comment theo bài viết cực nhanh
//        @Index(name = "idx_comment_post", columnList = "post_id"),
//        
//        // Index cho parent_id: Tìm các câu reply cực nhanh
//        @Index(name = "idx_comment_parent", columnList = "parent_id")
//    }
)
@Getter @Setter
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ với Post (Nên dùng FetchType.LAZY để tối ưu)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    // Quan hệ với User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // Nội dung comment
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // --- PHẦN QUAN TRỌNG: Cấu trúc cây (Reply) ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comment> replies = new ArrayList<>();

    // --- PHẦN QUAN TRỌNG: JSONB ---
    // @JdbcTypeCode giúp Hibernate 6 tự động convert JSON <-> Object Java
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "properties", columnDefinition = "jsonb")
    private CommentProperties properties;

    // Thời gian
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    // Khởi tạo mặc định để tránh null pointer cho JSON
    @PrePersist
    public void prePersist() {
        if (this.properties == null) {
            this.properties = new CommentProperties();
        }
    }
}