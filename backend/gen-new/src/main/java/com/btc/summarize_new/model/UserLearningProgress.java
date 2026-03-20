package com.btc.summarize_new.model;

import java.time.LocalDateTime;

import com.btc.summarize_new.model.data.LearningStatus;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_learning_progress")
@Getter
@Setter
@NoArgsConstructor  
@AllArgsConstructor 
@Builder
public class UserLearningProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private Long lessonId;

    @Enumerated(EnumType.STRING)
    private LearningStatus status; // NOT_STARTED, COMPLETED

    private LocalDateTime updatedAt;
}
