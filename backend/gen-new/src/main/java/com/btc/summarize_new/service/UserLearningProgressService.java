package com.btc.summarize_new.service;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.UserLearningProgressRequest;
import com.btc.summarize_new.dto.UserLearningProgressResponse;
import com.btc.summarize_new.model.UserLearningProgress;
import com.btc.summarize_new.repository.UserLearningProgressRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserLearningProgressService {

    private final UserLearningProgressRepository repo;

    /* ===== GET PROGRESS ===== */
    public UserLearningProgressResponse getProgress(Long userId, Long lessonId) {
        return repo.findByUserIdAndLessonId(userId, lessonId)
                .map(this::toResponse)
                .orElse(null); // Hoặc trả về status NOT_STARTED mặc định
    }
    
    public List<UserLearningProgressResponse> getByUserId(Long userId){
    	// Lấy danh sách entity từ DB
        List<UserLearningProgress> list = repo.findAllByUserId(userId);
        
        // Convert sang List Response (DTO)
        return list.stream()
                .map(this::toResponse)
                .toList();
    }
    
    @Transactional
    public UserLearningProgressResponse createOrUpdate(UserLearningProgressRequest request) {
        // Tìm bản ghi hiện có dựa trên userId và lessonId
        return repo.findByUserIdAndLessonId(request.getUserId(), request.getLessonId())
            .map(existingEntity -> {
                // TRƯỜNG HỢP 1: Đã tồn tại -> Thực hiện Cập nhật
                existingEntity.setStatus(request.getStatus());
                existingEntity.setUpdatedAt(LocalDateTime.now());
                return toResponse(repo.save(existingEntity));
            })
            .orElseGet(() -> {
                // TRƯỜNG HỢP 2: Chưa tồn tại -> Thực hiện Tạo mới
                UserLearningProgress newEntity = UserLearningProgress.builder()
                        .userId(request.getUserId())
                        .lessonId(request.getLessonId())
                        .status(request.getStatus())
                        .updatedAt(LocalDateTime.now())
                        .build();
                return toResponse(repo.save(newEntity));
            });
    }
    
    /* ===== DELETE (Xóa bản ghi) ===== */
    @Transactional
    public void delete(Long id) {
        UserLearningProgress entity = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy tiến độ với ID: " + id));
        
        // Với tiến độ học tập, thường là xóa hẳn khỏi DB (Hard Delete)
        // Nếu bạn muốn xóa mềm thì thêm field 'active' vào Entity như SentenceStructure
        repo.delete(entity);
    }

    /* ===== MAPPING ===== */
    private UserLearningProgressResponse toResponse(UserLearningProgress e) {
        return new UserLearningProgressResponse(
                e.getId(),
                e.getUserId(),
                e.getLessonId(),
                e.getStatus().toString(),
                e.getUpdatedAt()
        );
    }
}