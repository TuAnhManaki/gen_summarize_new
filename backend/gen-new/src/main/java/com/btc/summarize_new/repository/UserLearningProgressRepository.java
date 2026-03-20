package com.btc.summarize_new.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.btc.summarize_new.model.UserLearningProgress;

public interface UserLearningProgressRepository extends JpaRepository<UserLearningProgress, Long> {
    Optional<UserLearningProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    
    List<UserLearningProgress> findAllByUserId(Long userId);
}
