package com.btc.summarize_new.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor // <--- Cực kỳ quan trọng để nhận dữ liệu từ JSON
@AllArgsConstructor
@Builder
public class CategoryDTO {
	  @JsonProperty("name") // Đảm bảo khớp chính xác với key "name" từ JSON
	    private String name;

	    @JsonProperty("slug")
	    private String slug;
}