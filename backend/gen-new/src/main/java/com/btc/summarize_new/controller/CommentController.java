package com.btc.summarize_new.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.btc.summarize_new.dto.CommentDTO;
import com.btc.summarize_new.service.CommentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    // GET /api/comments/post/10
    // Lấy danh sách comment của bài viết
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<CommentDTO.Response>> getCommentsByPost(@PathVariable UUID postId) {
        return ResponseEntity.ok(commentService.getByPost(postId));
    }

    // POST /api/comments
    // Tạo comment mới (kèm thông tin device)
    @PostMapping
    public ResponseEntity<CommentDTO.Response> createComment(@RequestBody CommentDTO.CreateRequest request) {
        return ResponseEntity.ok(commentService.createComment(request));
    }

    // PUT /api/comments/5
    // Sửa comment (Backend tự động lưu lịch sử vào JSONB)
    @PutMapping("/{id}")
    public ResponseEntity<CommentDTO.Response> updateComment(
            @PathVariable Long id, 
            @RequestBody CommentDTO.UpdateRequest request) {
        return ResponseEntity.ok(commentService.updateComment(id, request.getNewContent()));
    }

    // PATCH /api/comments/5/like
    // Thả tim (Tăng likeCount trong JSONB)
    @PatchMapping("/{id}/like")
    public ResponseEntity<Void> likeComment(@PathVariable Long id) {
        commentService.likeComment(id);
        return ResponseEntity.noContent().build();
    }

    // GET /api/comments/search?device=iPhone
    // Demo tính năng search sâu trong JSONB
    @GetMapping("/search")
    public ResponseEntity<List<CommentDTO.Response>> searchByDevice(@RequestParam String device) {
        return ResponseEntity.ok(commentService.searchByDevice(device));
    }
}
