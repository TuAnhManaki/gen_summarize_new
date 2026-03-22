

  import { Component, OnInit } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { BehaviorSubject } from 'rxjs';
  import { NewsService } from '../../services/News.Service';
  
  @Component({
    selector: 'app-blog-feed',
    templateUrl: './blog-feed.component.html',
    styleUrls: ['./blog-feed.component.scss']
  })
  export class BlogFeedComponent implements OnInit {
    
    // 1. Lấy trực tiếp luồng dữ liệu từ Service
    overview$ = this.newsService.categoryOverview$;
    feed$ = this.newsService.categoryFeed$;
  
    // 2. State quản lý query cho danh sách Feed (để tiện đổi trang, lọc nguồn)
    private feedQuery = new BehaviorSubject<{ page: number, size: number, sources: string[] }>({
      page: 1, 
      size: 10, 
      sources: [] 
    });
  
    // Lưu slug hiện tại
    currentCategorySlug: string = '';
  
    constructor(
      private route: ActivatedRoute,
      private newsService: NewsService
    ) {}
  
    ngOnInit(): void {
      // 1. Lắng nghe sự thay đổi của SLUG trên URL
      this.route.paramMap.subscribe(params => {
        const slug = params.get('categorySlug'); // Lấy param categorySlug từ Route
        if (slug) {
          this.currentCategorySlug = slug;
          
          // Gọi API Tổng quan (Hero, Đọc nhiều, Sidebar) - Chỉ gọi 1 LẦN khi đổi chuyên mục
          this.newsService.fetchCategoryOverview(this.currentCategorySlug);
          
          // Reset query Feed về trang 1, rỗng bộ lọc mỗi khi vào chuyên mục mới
          this.feedQuery.next({ page: 1, size: 10, sources: [] });
          
        }
      });
  

      // 2. Lắng nghe sự thay đổi của State phân trang/lọc để gọi API Feed
      this.feedQuery.subscribe(query => {
        if (this.currentCategorySlug) {
          const arryCategorySlug = [this.currentCategorySlug];
          // Chỉ gọi lại API danh sách bài viết
          this.newsService.fetchCategoryFeed(
            query.page, 
            query.size, 
            query.sources,
            arryCategorySlug, 
          );
        }
      });
    }
  
    // =========================================
    // CÁC HÀM TƯƠNG TÁC TỪ GIAO DIỆN
    // =========================================
  
    // Chuyển trang (Chỉ tác động đến luồng Feed)
    changePage(newPage: number, totalPages: number): void {
      if (newPage >= 1 && newPage <= totalPages) {
        const currentQuery = this.feedQuery.getValue();
        this.feedQuery.next({ ...currentQuery, page: newPage });
        
        // Cuộn màn hình lên vị trí bắt đầu của danh sách bài viết
        window.scrollTo({ top: 500, behavior: 'smooth' }); 
      }
    }
  
    // Lọc nguồn (Chỉ tác động đến luồng Feed)
    toggleSourceFilter(sourceId: string, currentFilters: any[]): void {
      // 1. Thay đổi trạng thái checked trên giao diện
      const filterToUpdate = currentFilters.find(f => f.id === sourceId);
      if (filterToUpdate) {
        filterToUpdate.checked = !filterToUpdate.checked;
      }
      
      // 2. Gom các ID nguồn đang được check lại thành mảng
      const activeSources = currentFilters
        .filter(f => f.checked)
        .map(f => f.id);
  
      // 3. Cập nhật Subject để kích hoạt gọi lại API Feed (đưa về trang 1)
      const currentQuery = this.feedQuery.getValue();
      this.feedQuery.next({ ...currentQuery, page: 1, sources: activeSources });
    }
  }