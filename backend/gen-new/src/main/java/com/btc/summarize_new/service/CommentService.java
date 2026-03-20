package com.btc.summarize_new.service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.CommentDTO;
import com.btc.summarize_new.model.Comment;
import com.btc.summarize_new.model.data.CommentProperties;
import com.btc.summarize_new.repository.CommentRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    // Inject thêm PostRepository và UserRepository nếu cần validate

    // 1. Tạo Comment
    public CommentDTO.Response createComment(CommentDTO.CreateRequest req) {
        Comment comment = new Comment();
        // Giả sử set Post và User thông qua ID (bạn cần findById ở đây)
        // comment.setPost(postRepository.getReferenceById(req.getPostId()));
        // comment.setUser(userRepository.getReferenceById(req.getUserId()));
        
        comment.setContent(req.getContent());

        // Khởi tạo Properties JSONB
        CommentProperties props = new CommentProperties();
        props.setDeviceInfo(req.getDeviceInfo());
        props.setLikesCount(0);
        comment.setProperties(props);

        Comment saved = commentRepository.save(comment);
        return mapToDTO(saved);
    }

    // 2. Sửa Comment (Logic lưu lịch sử JSONB)
    @Transactional
    public CommentDTO.Response updateComment(Long id, String newContent) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        CommentProperties props = comment.getProperties();
        
        // Lưu lịch sử vào mảng JSON
        props.getEditHistory().add(new CommentProperties.EditLog(
            java.time.LocalDateTime.now(), 
            comment.getContent()
        ));
        
        props.setEdited(true);
        comment.setContent(newContent);
        // Hibernate tự update JSONB vào DB khi transaction kết thúc
        
        return mapToDTO(comment);
    }

    // 3. Lấy list theo Post
    public List<CommentDTO.Response> getByPost(UUID postId) {
    	
        return commentRepository.findByPostId(postId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    // 4. Like Comment (Tối ưu hiệu năng)
    @Transactional
    public void likeComment(Long id) {
        commentRepository.incrementLikeCount(id);
    }
    
    // 5. Tìm theo Device (Query trong JSONB)
    public List<CommentDTO.Response> searchByDevice(String deviceName) {
        return commentRepository.findByDevice(deviceName).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // Helper: Chuyển Entity sang DTO
    private CommentDTO.Response mapToDTO(Comment comment) {
        CommentDTO.Response dto = new CommentDTO.Response();
        dto.setId(comment.getId());
        dto.setContent(comment.getContent());
        dto.setCreatedAt(comment.getCreatedAt());
        // dto.setUserId(comment.getUser().getId());
        
        // Đây là chỗ quan trọng: Dữ liệu JSONB sẽ được trả về dạng Object chuẩn
        dto.setProperties(comment.getProperties()); 
        return dto;
    }
}