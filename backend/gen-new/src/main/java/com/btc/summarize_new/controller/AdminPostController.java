package com.btc.summarize_new.controller;

import java.util.UUID;

import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.btc.summarize_new.dto.BlogDashboardDTO;
import com.btc.summarize_new.dto.PostCreateDTO;
import com.btc.summarize_new.dto.PostListDTO;
import com.btc.summarize_new.dto.base.PageResponse;
import com.btc.summarize_new.model.Post;
import com.btc.summarize_new.service.AdminBlogService;
import com.btc.summarize_new.service.BlogDashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/posts")
//@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class AdminPostController {

	private final BlogDashboardService dashboardService;
    private final AdminBlogService adminService;

    // GET /api/admin/posts?page=0&size=10&keyword=...
    @GetMapping
    public ResponseEntity<PageResponse<PostListDTO>> getPosts(
            @RequestParam(required = false, name="keyword") String keyword,
            @RequestParam(required = false, name="categoryId") Long categoryId,
            @RequestParam(required = false, name="status") String status,
            @RequestParam(defaultValue = "0", name="page") int page,
            @RequestParam(defaultValue = "10", name="size") int size
    ) {
        return ResponseEntity.ok(adminService.getPosts(keyword, categoryId, status, page, size));
    }

    // GET /api/admin/posts/{id}
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable(name="id") UUID id) {
        return ResponseEntity.ok(adminService.getPostById(id));
    }
    

    @GetMapping("/dashboard")
    public ResponseEntity<BlogDashboardDTO> getStats() {
        return ResponseEntity.ok(dashboardService.getDashboardStats());
    }

    // POST /api/admin/posts
    @PostMapping
    public ResponseEntity<Post> createPost(@RequestBody PostCreateDTO dto) {
        return ResponseEntity.ok(adminService.createPost(dto));
    }

    // PUT /api/admin/posts/{id}
    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(@PathVariable(name="id") UUID id, @RequestBody PostCreateDTO dto) {
        return ResponseEntity.ok(adminService.updatePost(id, dto));
    }

    // DELETE /api/admin/posts/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable(name="id") UUID id) {
        adminService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}