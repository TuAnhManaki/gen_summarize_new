
    import { Component, OnInit } from '@angular/core';
    import { HttpClient, HttpHeaders } from '@angular/common/http';
    import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
    import { environment } from '@env/environment';

    // Định nghĩa Interface (DTO) khớp với Backend Spring Boot
    export interface ArticleResponse {
      id: number;
      slug: string;
      title: string;
      image: string;
      category: string;
      excerpt: string; // Chứa nội dung HTML do AI tóm tắt
      date: string;
      views: number;
      isSummarized: boolean;
      author: string;
      tags: string[];
      sourceName: string;
    }
    
    // Interface hứng dữ liệu phân trang từ Spring Data JPA (Page<T>)
    export interface PageResponse<T> {
      content: T[];
      totalPages: number;
      totalElements: number;
      number: number; // currentPage (bắt đầu từ 0)
    }
    

    @Component({
      selector: 'app-blog-list',
      templateUrl: './blog-list.component.html',
      styleUrls: ['./blog-list.component.scss']
    })
    export class BlogListComponent implements OnInit {
      // Khởi tạo các biến để bind ra HTML
      trendingTopics: string[] = [];
      trendingTags: string[] = [];
      featuredPosts: ArticleResponse[] = [];
      recentHighlightPosts: ArticleResponse[] = []; // Tương ứng với Weekly Top
      latestNews: ArticleResponse[] = [];
      hotNews: ArticleResponse[] = [];
    
      // Biến phục vụ phân trang cho phần Latest News
      currentPage: number = 0;
      totalPages: number = 0;
      pageNumbers: number[] = [];
      isLoadingNews: boolean = false;
    
      // URL gốc của Backend (Trong thực tế nên đặt trong file environment.ts)
      private apiUrl = environment.apiServeUrl + 'api/news/home';
    
      constructor(
        private http: HttpClient,
        private sanitizer: DomSanitizer
      ) {}
    
      ngOnInit(): void {
        // Gọi đồng loạt các API khi Component vừa khởi tạo
        this.loadTrendingTags();
        this.loadFeaturedPosts();
        this.loadWeeklyTop();
        this.loadHotNews();
        this.loadLatestNews(0); // Load trang đầu tiên (page = 0)
      }
    
      // --- CÁC HÀM GỌI API ---
    
      headersw = new HttpHeaders({
        'X-Tunnel-Skip-Efficiency-Check': 'true' 
      });
      
      loadTrendingTags(): void {
        this.http.get<string[]>(`${this.apiUrl}/trending-tags`).subscribe({
          next: (tags) => {
            this.trendingTags = tags;
            this.trendingTopics = tags; // Dùng chung mảng cho thanh chạy Marquee phía trên
          },
          error: (err) => console.error('Lỗi khi tải Trending Tags:', err)
        });
      }
    
      loadFeaturedPosts(): void {
        this.http.get<ArticleResponse[]>(`${this.apiUrl}/featured`).subscribe({
          next: (data) => this.featuredPosts = data,
          error: (err) => console.error('Lỗi khi tải Featured Posts:', err)
        });
      }
    
      loadWeeklyTop(): void {
        this.http.get<ArticleResponse[]>(`${this.apiUrl}/weekly-top`).subscribe({
          next: (data) => this.recentHighlightPosts = data,
          error: (err) => console.error('Lỗi khi tải Weekly Top:', err)
        });
      }
    
      loadHotNews(): void {
        this.http.get<ArticleResponse[]>(`${this.apiUrl}/hot`).subscribe({
          next: (data) => this.hotNews = data,
          error: (err) => console.error('Lỗi khi tải Hot News:', err)
        });
      }
    
      loadLatestNews(page: number): void {
        this.isLoadingNews = true;
        this.http.get<PageResponse<ArticleResponse>>(`${this.apiUrl}/latest?page=${page}&size=5`)
          .subscribe({
            next: (response) => {
              this.latestNews = response.content;
              this.currentPage = response.number;
              this.totalPages = response.totalPages;
              
              this.generatePageNumbers();
              this.isLoadingNews = false;
    
              // Hiệu ứng UX: Cuộn mượt mà lên phần đầu của Latest News khi chuyển trang
              if (page > 0) {
                const anchor = document.getElementById('latest-news-anchor');
                if (anchor) {
                  anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }
            },
            error: (err) => {
              console.error('Lỗi khi tải Latest News:', err);
              this.isLoadingNews = false;
            }
          });
      }
    
      // --- CÁC HÀM TIỆN ÍCH (UTILITIES) ---
    
      // Xử lý sự kiện click nút chuyển trang
      onPageChange(page: number): void {
        if (page >= 0 && page < this.totalPages && page !== this.currentPage) {
          this.loadLatestNews(page);
        }
      }
    
      // Tạo mảng pageNumbers để vẽ các nút bấm [1] [2] [3] ra HTML
      private generatePageNumbers(): void {
        this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i);
      }
    
      // Chuyển đổi chuỗi HTML của AI thành dạng an toàn để Angular render
      getSafeHtml(html: string): SafeHtml {
        if (!html) return '';
        return this.sanitizer.bypassSecurityTrustHtml(html);
      }
    }