package com.btc.summarize_new.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.btc.summarize_new.dto.CategoryDTO;
import com.btc.summarize_new.model.Category;
import com.btc.summarize_new.repository.CategoryRepository;
import com.btc.summarize_new.utils.SlugUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    @Transactional
    public Category createCategory(CategoryDTO dto) {
        // Tự động tạo slug nếu chưa có hoặc tạo mới từ name
        if (dto.getSlug() == null || dto.getSlug().isEmpty()) {
            dto.setSlug(SlugUtils.makeSlug(dto.getName()));
        }
        
        // Kiểm tra xem slug đã tồn tại chưa để tránh lỗi UNIQUE của Postgres
        categoryRepository.findBySlug(dto.getSlug()).ifPresent(c -> {
            throw new RuntimeException("Slug đã tồn tại: " + dto.getSlug());
        });
        Category category = mapDtoToEntity(dto); 

        return categoryRepository.save(category);
    }

    public Category getById(Integer id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Category với ID: " + id));
    }

    
 // 3. Cập nhật
    @Transactional
    public Category updateCategory(Integer id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục ID: " + id));

        // Check trùng slug DashboardService.java)(nhưng bỏ qua chính nó)
        if (categoryRepository.existsBySlugAndIdNot(categoryDetails.getSlug(), id)) {
            throw new RuntimeException("Slug '" + categoryDetails.getSlug() + "' đã tồn tại ở danh mục khác!");
        }

        category.setName(categoryDetails.getName());
        category.setSlug(categoryDetails.getSlug());
        
        return categoryRepository.save(category);
    }

    // 4. Xóa
    public void deleteCategory(Integer id) {
        if (!categoryRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy danh mục để xóa");
        }
        // Lưu ý: Nếu có bài viết đang dùng category này, DB sẽ báo lỗi Foreign Key Constraint.
        // Bạn có thể try-catch để báo lỗi thân thiện hơn.
        try {
            categoryRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException("Không thể xóa danh mục này vì đã có bài viết sử dụng.");
        }
    }
 
    
    private Category mapDtoToEntity(CategoryDTO dto) {
        if (dto == null) return null;

        return Category.builder()
                .name(dto.getName())
                // Logic xử lý: Nếu DTO không có slug, tự tạo từ Name
                .slug(dto.getSlug() != null && !dto.getSlug().isEmpty() 
                      ? dto.getSlug() 
                      : SlugUtils.makeSlug(dto.getName()))
                .build();
    }

	
}