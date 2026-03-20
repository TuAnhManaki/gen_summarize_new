import { Component, OnInit } from '@angular/core';
import { AdminBlogService } from '../../services/admin-blog.service';
import { BlogPostListDTO } from '../../models/blog.model';
import { PageResponse } from '@app/core/models/pagination.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.scss']
})
export class PostListComponent implements OnInit {
  
  posts: BlogPostListDTO[] = [];
  isLoading = false;

  // --- Filter State ---
  filter = {
    keyword: '',
    categoryId: null as number | null,
    status: null as string | null // 'PUBLISHED', 'DRAFT', 'ARCHIVED'
  };

  // --- Pagination State ---
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;

  // --- Sort State ---
  sortBy = 'createdAt'; // Mặc định sort theo ngày tạo
  sortDir = 'desc';     // Mặc định mới nhất lên đầu

  // Dữ liệu giả cho Dropdown (Nên load từ API Category)
  categories = [
    { id: 1, name: 'Lập trình' },
    { id: 2, name: 'Tiếng Anh' },
    { id: 3, name: 'Đời sống' }
  ];

  constructor(private adminService: AdminBlogService) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts() {
    this.isLoading = true;
    
    this.adminService.getPosts(
      this.filter.keyword,
      this.filter.categoryId,
      this.filter.status,
      this.currentPage,
      this.pageSize,
      this.sortBy,
      this.sortDir
    ).subscribe({
      next: (res: PageResponse<BlogPostListDTO>) => {
        // Giả sử Backend Spring Boot trả về Page<T>
        this.posts = res.items; 
        this.totalElements = res.totalElements;
        this.totalPages = res.totalPages;      
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu:', err);
        this.isLoading = false;
      }
    });
  }

  // --- ACTIONS ---

  // 1. Tìm kiếm (Reset về trang 0)
  onSearch() {
    this.currentPage = 0;
    this.loadPosts();
  }

  // 2. Xóa bộ lọc
  clearFilter() {
    this.filter = { keyword: '', categoryId: null, status: null };
    this.onSearch();
  }

  // 3. Thay đổi trang
  onPageChange(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadPosts();
    }
  }

  // 4. Sắp xếp cột
  onSort(field: string) {
    if (this.sortBy === field) {
      // Nếu click lại cột cũ -> Đảo chiều
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      // Nếu click cột mới -> Mặc định desc
      this.sortBy = field;
      this.sortDir = 'desc';
    }
    this.loadPosts();
  }

  // 5. Xóa bài viết
  deletePost(id: string) {
    if (confirm('Bạn chắc chắn muốn xóa bài viết này?')) {
      this.adminService.deletePost(id).subscribe(() => {
        this.loadPosts();
      });
    }
  }

  // Helper: CSS Class cho Status
  getStatusClass(status: string): string {
    switch (status) {
      case 'PUBLISHED': return 'badge-success';
      case 'DRAFT': return 'badge-warning';
      case 'ARCHIVED': return 'badge-secondary';
      default: return '';
    }
  }
}