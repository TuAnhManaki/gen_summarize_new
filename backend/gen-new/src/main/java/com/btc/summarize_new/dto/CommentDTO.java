package com.btc.summarize_new.dto;


import java.time.LocalDateTime;

import com.btc.summarize_new.model.data.CommentProperties;

import lombok.Data;


public class CommentDTO {

    // Dùng để hứng dữ liệu khi tạo comment mới
    @Data
    public static class CreateRequest {
        private Long postId;
        private Long userId; // Trong thực tế nên lấy từ Token (SecurityContext)
        private String content;
        private String deviceInfo; // Frontend gửi lên: "PC - Chrome", "iPhone 14", v.v.
    }

    // Dùng để hứng dữ liệu khi sửa comment
    @Data
    public static class UpdateRequest {
        private String newContent;
    }

    // Dùng để trả dữ liệu về cho Angular
    @Data
    public static class Response {
        private Long id;
        private Long userId;
        private String content;
        private LocalDateTime createdAt;
        
        // Trả về nguyên cục JSON properties để Frontend tự xử lý
        private CommentProperties properties; 
    }
}

