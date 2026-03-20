package com.btc.summarize_new.model;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.annotations.Type;
import jakarta.persistence.*;
import lombok.*;

@Entity
@NoArgsConstructor
@Table(name = "articles")
@Data
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "source_id")
    private Source source;

    private String title;
    
    private String aiModelUsed;
    
    @Column(unique = true, columnDefinition = "TEXT")
    private String originUrl;

    @Column(columnDefinition = "TEXT")
    private String rawContent;

    @Column(columnDefinition = "TEXT")
    private String summaryContent;
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
    
    private String author;

    @Column(columnDefinition = "integer default 0")
    private Integer views = 0; // Khởi tạo mặc định là 0

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    private Boolean isSummarized = false;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt = LocalDateTime.now();
}