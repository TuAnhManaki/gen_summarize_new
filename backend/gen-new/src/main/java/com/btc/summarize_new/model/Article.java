package com.btc.summarize_new.model;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.hibernate.annotations.Type;
import org.springframework.data.annotation.Transient;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import io.hypersistence.utils.hibernate.type.json.JsonBinaryType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Table(name = "articles")
@Data
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
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
    
    private String nameSlug;

    @Column(columnDefinition = "integer default 0")
    private Integer views = 0; // Khởi tạo mặc định là 0

    @Type(JsonBinaryType.class)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> metadata = new HashMap<>();

    private Boolean isSummarized = false;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Transient
    public String getMetadataAsJsonString() {
        if (this.metadata == null || this.metadata.isEmpty()) {
            return "{}";
        }
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Lấy chính cái Map của bạn để chuyển thành String
            return mapper.writeValueAsString(this.metadata); 
        } catch (JsonProcessingException e) {
            return "{}"; 
        }
    }
}