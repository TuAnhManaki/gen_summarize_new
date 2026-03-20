package com.btc.summarize_new.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLearningProgressResponse {
    private Long id;
    private Long userId;
    private Long lessonId;
    private String status;
    private LocalDateTime updatedAt;
}