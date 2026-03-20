package com.btc.summarize_new.model.data;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CommentProperties implements Serializable {
	@JsonProperty("likes_count")
    private int likesCount = 0; // Mặc định là 0

    @JsonProperty("device_info")
    private String deviceInfo;

    @JsonProperty("is_edited")
    private boolean isEdited = false;

    @JsonProperty("edit_history")
    private List<EditLog> editHistory = new ArrayList<>();

    // Class con để lưu lịch sử sửa
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EditLog implements Serializable {
        @JsonProperty("timestamp")
        private LocalDateTime timestamp;

        @JsonProperty("old_content")
        private String oldContent;
    }
}