package com.btc.summarize_new.dto;

import java.time.LocalDateTime;

import com.btc.summarize_new.model.data.LearningStatus;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLearningProgressRequest {
    private Long id;
    private Long userId;
    private Long lessonId;
    private LearningStatus status;
    private LocalDateTime updatedAt;
}