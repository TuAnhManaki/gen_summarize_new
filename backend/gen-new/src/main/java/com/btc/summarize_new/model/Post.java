package com.btc.summarize_new.model;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.Type;

import com.btc.summarize_new.model.data.PostMeta;
import com.btc.summarize_new.model.data.PostStatus;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "posts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    
    @Column(unique = true)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String content; // HTML Content

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    private String authorName;

    @Enumerated(EnumType.STRING)
    private PostStatus status; // Enum: DRAFT, PUBLISHED

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Mapping JSONB vào Java Object
    @Type(JsonType.class)
    @Column(columnDefinition = "jsonb")
    private PostMeta metaData;
    
    public int getSafeViews() {
        if (this.metaData != null && this.metaData.getStats() != null) {
            return this.metaData.getStats().getViews();
        }
        return 0;
    }

    public int getSafeLikes() {
        if (this.metaData != null && this.metaData.getStats() != null) {
            return this.metaData.getStats().getLikes();
        }
        return 0;
    }
}