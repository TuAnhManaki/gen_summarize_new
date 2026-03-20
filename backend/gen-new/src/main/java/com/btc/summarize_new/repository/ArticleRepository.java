package com.btc.summarize_new.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.btc.summarize_new.model.Article;


@Repository
public interface ArticleRepository extends JpaRepository<Article, Long>{
	boolean existsByOriginUrl(String originUrl);
	
	// Tìm 10 bài mới nhất chưa tóm tắt
    List<Article> findTop10ByIsSummarizedFalseOrderByCreatedAtDesc();
    List<Article> findTop1ByIsSummarizedFalseOrderByCreatedAtDesc();

    // Tìm bài chưa tóm tắt theo ID nguồn cụ thể (Ví dụ: chỉ ưu tiên tóm tắt báo VnExpress trước)
    List<Article> findTop10BySourceIdAndIsSummarizedFalseOrderByCreatedAtDesc(Long sourceId);
    
    List<Article> findTop3ByOrderByCreatedAtDesc();
    List<Article> findTop5ByOrderByCreatedAtDesc();
    Page<Article> findAll(Pageable pageable);

    // Tìm bài chưa tóm tắt thuộc Category cụ thể
    // List<Article> findTop10ByCategoryIdAndIsSummarizedFalseOrderByCreatedAtDesc(Long catId);
}
