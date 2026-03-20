package com.btc.summarize_new.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter 
@Setter 
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "sources")
@Data
public class Source {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private String rssUrl;
    private String selector; // CSS Selector để lấy nội dung chính (vd: article.fck_detail)
    
    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;
}