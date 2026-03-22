package com.btc.summarize_new.dto.blog;


public record CategorysDto(
	    Long id,
	    String name,
	    String slug
	) {
	    // Constructor phụ để xử lý trường hợp ID từ DB trả về là Integer
	    public CategorysDto(Integer id, String name, String slug) {
	        this(id != null ? id.longValue() : null, name, slug);
	    }

	    // Nếu bạn không dùng description trong Record này:
	    /*
	    public CategorysDto(Integer id, String name, String slug) {
	        this(id != null ? id.longValue() : null, name, slug, null);
	    }
	    */
	}