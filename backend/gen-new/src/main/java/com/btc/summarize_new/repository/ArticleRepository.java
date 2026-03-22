package com.btc.summarize_new.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.model.Article;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
	boolean existsByOriginUrl(String originUrl);
	
    Optional<Article> findByNameSlug(String slug);


	// Tìm 10 bài mới nhất chưa tóm tắt
	List<Article> findTop10ByIsSummarizedFalseOrderByCreatedAtDesc();

	List<Article> findTop1ByIsSummarizedFalseOrderByCreatedAtDesc();

	// Lấy Top 5 bài mới nhất của chuyên mục (Dùng cho Hero Section)
    List<Article> findTop5ByCategorySlugOrderByPublishedAtDesc(String categorySlug);

    // Lấy Top 3 bài đọc nhiều nhất tuần (Dùng cho Sidebar)
    List<Article> findTop3ByCategorySlugOrderByViewsDesc(String categorySlug);
    
	// Tìm bài chưa tóm tắt theo ID nguồn cụ thể (Ví dụ: chỉ ưu tiên tóm tắt báo
	// VnExpress trước)
	List<Article> findTop10BySourceIdAndIsSummarizedFalseOrderByCreatedAtDesc(int sourceId);

	List<Article> findTop3ByOrderByCreatedAtDesc();

	List<Article> findTop5ByOrderByCreatedAtDesc();

	Page<Article> findAll(Pageable pageable);

	// Tìm bài chưa tóm tắt thuộc Category cụ thể
	// List<Article>
	// findTop10ByCategoryIdAndIsSummarizedFalseOrderByCreatedAtDesc(Long catId);

	/**
	 * Lấy danh sách bài viết theo nguồn (Filter Sidebar) Dùng JOIN FETCH để lấy
	 * luôn thông tin Source trong 1 câu SQL (Tránh lỗi N+1 Query)
	 */
	@Query(value = "SELECT a FROM Article a " +
            "JOIN FETCH a.source s " + 
            "LEFT JOIN FETCH a.category c " + 
            "WHERE (:#{#sources == null || #sources.isEmpty()} = true OR s.slug IN :sources) " +
            "AND (:#{#categories == null || #categories.isEmpty()} = true OR c.slug IN :categories)", 
    countQuery = "SELECT COUNT(a) FROM Article a " +
            "JOIN a.source s " +
            "LEFT JOIN a.category c " + // Đã sửa thành LEFT JOIN cho khớp với câu trên
            "WHERE (:#{#sources == null || #sources.isEmpty()} = true OR s.slug IN :sources) " +
            "AND (:#{#categories == null || #categories.isEmpty()} = true OR c.slug IN :categories)")
    Page<Article> findByFilters(
            @Param("sources") List<String> sources, 
            @Param("categories") List<String> categories,
            Pageable pageable
    );

	/**
	 * Lấy tất cả bài viết (Trường hợp User không chọn Filter nào)
	 */
	@Query(value = "SELECT a FROM Article a JOIN FETCH a.source", countQuery = "SELECT COUNT(a) FROM Article a")
	Page<Article> findAllWithSource(Pageable pageable);

	// ==========================================
	// 2. CÁC QUERY CHO HERO SECTION (TIN NỔI BẬT)
	// ==========================================

	/**
	 * Lấy 5 bài viết mới nhất cho phần Hero (1 tin to, 4 tin nhỏ)
	 */
	@Query("SELECT a FROM Article a JOIN FETCH a.source ORDER BY a.publishedAt DESC LIMIT 5")
	List<Article> findTop5HeroArticles();

	// ==========================================
	// 3. CÁC QUERY CHO CATEGORY BOXES
	// ==========================================

	/**
	 * Lấy các bài viết mới nhất theo từng Category (VD: Lấy 3 bài Công nghệ) Dùng
	 * JPA Derived Query Method (Spring tự hiểu 'Top3' và 'OrderBy')
	 */
	List<Article> findTop3ByCategoryNameOrderByPublishedAtDesc(String categoryName);

	// ==========================================
	// 4. QUERY HỖ TRỢ CRAWLER (CHỐNG TRÙNG LẶP)
	// ==========================================

	/**
	 * Dùng ON CONFLICT DO NOTHING của PostgreSQL để bỏ qua insert nếu URL đã tồn
	 * tại. Trả về số dòng bị ảnh hưởng (1 = Insert thành công, 0 = Bị trùng, bỏ
	 * qua). Lưu ý: Đảm bảo cột origin_url đã được set UNIQUE trong Database.
	 */
	@Modifying
	@Transactional
	@Query(value = """
			INSERT INTO articles (title, raw_content, author, origin_url, metadata, published_at, views, category_id, source_id, name_slug)
			VALUES (:#{#a.title}, :#{#a.rawContent}, :#{#a.author}, :#{#a.originUrl}, CAST(:#{#a.metadataAsJsonString} AS jsonb), :#{#a.publishedAt}, :#{#a.views}, :#{#a.category.id}, :#{#a.source.id}, :#{#a.nameSlug})
			ON CONFLICT (origin_url) DO NOTHING
			""", nativeQuery = true)
	int insertIgnoreConflict(@Param("a") Article article);

	List<Article> findTop4ByCategoryIdAndIdNotOrderByPublishedAtDesc(int categoryId, Long id);
	
	List<Article> findTop4ByCategoryIdAndNameSlugNotOrderByPublishedAtDesc(int categoryId, String slug);

}
