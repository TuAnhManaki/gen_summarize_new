package com.btc.summarize_new.model.data;

import java.io.Serializable;
import java.util.List;
import lombok.Data;

@Data // Lombok
public class PostMeta implements Serializable {
    private String thumbnail;
    private String summary;
    private int readingTime;
    private List<String> tags;
    private SeoInfo seo;
    private PostStats stats;
    
    public PostStats getStats() {
        if (this.stats == null) {
            this.stats = new PostStats(); // Tự tạo mới nếu bị null
        }
        return this.stats;
    }
    @Data
    public static class SeoInfo {
    	private String title;       // Meta Title
        private String keywords;
        private String description;
    }
    @Data
    public static class PostStats implements Serializable {
        private int views = 0;
        private int likes = 0;
    }
}