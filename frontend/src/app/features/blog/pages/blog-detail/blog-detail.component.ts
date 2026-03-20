

  import { Component, OnInit, OnDestroy } from '@angular/core';
  import { ActivatedRoute } from '@angular/router';
  import { HttpClient } from '@angular/common/http';
  import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
  import { Subscription } from 'rxjs';
import { environment } from '@env/environment';
  
  // Interface hứng dữ liệu từ Backend
  export interface ArticleDetail {
    id: number;
    title: string;
    category: string;
    author: string;
    date: string;
    views: number;
    commentsCount: number;
    image: string;
    rawContent: string;
    summaryContent: string;
    isSummarized: boolean;
    tags: string[];
  }
  
  @Component({
    selector: 'app-blog-detail',
    templateUrl: './blog-detail.component.html',
    styleUrls: ['./blog-detail.component.scss']
  })
  export class BlogDetailComponent implements OnInit, OnDestroy {
    article!: ArticleDetail;
    safeContent!: SafeHtml;
    
    // Trạng thái hiển thị
    isLoading: boolean = true;
    isSummarizingNow: boolean = false; // Cờ hiệu đang gọi AI tóm tắt
    
    // Dữ liệu Mock cho Sidebar & Bình luận
    latestNews: any[] = [];
    comments: any[] = [];
    
    private routeSub!: Subscription;
    private apiUrl = environment.apiServeUrl + 'api/news'; // Chỉnh lại theo cấu hình của bạn
  
    constructor(
      private route: ActivatedRoute,
      private http: HttpClient,
      private sanitizer: DomSanitizer
    ) {}
  
    ngOnInit(): void {
      // Lắng nghe thay đổi URL (khi click từ bài này sang bài khác ở Sidebar)
      this.routeSub = this.route.paramMap.subscribe(params => {
        const slug = params.get('slug');
        if (slug) {
          // Giả sử slug có dạng "123-bai-viet", ta bóc lấy ID 123
          const articleId = Number(slug.split('-')[0]); 
          this.loadArticleDetail(articleId);
          this.incrementView(articleId);
        }
      });
  
      this.loadMockSidebarData();
    }
  
    // Lấy chi tiết bài báo
    loadArticleDetail(id: number): void {
      this.isLoading = true;
      this.http.get<ArticleDetail>(`${this.apiUrl}/articles/${id}`).subscribe({
        next: (data) => {
          this.article = data;
          this.isLoading = false;
          
          // KIỂM TRA TRẠNG THÁI TÓM TẮT
          if (this.article.isSummarized && this.article.summaryContent) {
            // Đã tóm tắt -> Render HTML xịn của AI
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.summaryContent);
          } else {
            // Chưa tóm tắt -> Render tạm nội dung gốc
            this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.rawContent || '<p>Đang tải nội dung...</p>');
            // Kích hoạt tóm tắt ngay lập tức
            this.triggerSummarize(this.article.id);
          }
        },
        error: (err) => {
          console.error('Không tìm thấy bài báo', err);
          this.isLoading = false;
        }
      });
    }
  
    // Gọi API kích hoạt AI tóm tắt
    triggerSummarize(id: number): void {
      this.isSummarizingNow = true;
      this.http.post(`${this.apiUrl}/${id}/summarize`, {}, { responseType: 'text' }).subscribe({
        next: () => {
          this.isSummarizingNow = false;
          // Tóm tắt thành công -> Load lại dữ liệu bài viết để lấy summaryContent mới
          this.loadArticleDetail(id);
        },
        error: (err) => {
          console.error('Lỗi khi tóm tắt tự động', err);
          this.isSummarizingNow = false;
        }
      });
    }
  
    // Tăng lượt xem (Fire and Forget - Không cần đợi kết quả trả về)
    incrementView(id: number): void {
      this.http.put(`${this.apiUrl}/${id}/view`, {}).subscribe();
    }
  
    ngOnDestroy(): void {
      if (this.routeSub) {
        this.routeSub.unsubscribe();
      }
    }
  
    // Dữ liệu giả định để giao diện của bạn không bị trống
    loadMockSidebarData() {
      this.latestNews = [
        { title: 'Thị trường công nghệ tuần qua', date: '2 Giờ trước', image: 'https://via.placeholder.com/80x64' },
        { title: 'Báo cáo mới nhất về AI 2026', date: '5 Giờ trước', image: 'https://via.placeholder.com/80x64' }
      ];
      this.comments = [
        { user: 'Nguyễn Văn A', date: '12 PHÚT TRƯỚC', content: 'Bài viết rất hữu ích, tóm tắt nhanh gọn!', avatar: 'https://via.placeholder.com/48', isReply: false },
        { user: 'Trần Thị B', date: '5 PHÚT TRƯỚC', content: 'Tôi đồng ý.', avatar: 'https://via.placeholder.com/48', isReply: true }
      ];
    }
  }