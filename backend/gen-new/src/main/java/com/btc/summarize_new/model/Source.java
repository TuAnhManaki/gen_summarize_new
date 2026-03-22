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
    private String name; // "VnExpress"
    private String slug; // "vnexpress"
    private String rssUrl;
    private String selector; // CSS Selector để lấy nội dung chính (vd: article.fck_detail)
    
    private String colorClass; // "text-red-600"
}