import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NewsService } from '../../services/News.Service';

// Định nghĩa Interface cho bài viết (bạn có thể tách ra file riêng)
export interface ArticleDetail {
  id: string;
  title: string;
  category: string;
  source: string;
  author: string;
  publishedAt: string;
  rawContent: string; // Nội dung thô từ API (có thể là markdown hoặc HTML) 
  summaryContent: string;
  originUrl: string;
  metadata: {
    thumb: string; // URL ảnh thumbnail
    tags: string[];
  };
}

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  
  // Dữ liệu giả lập của bài viết (Thực tế bạn sẽ lấy qua API chi tiết bài viết dựa vào ID trên URL)
  // article: ArticleDetail = {
  //   id: '123',
  //   title: 'Vi mạch bán dẫn: Cơ hội lớn và thách thức cho các kỹ sư Việt Nam trong thập kỷ tới',
  //   category: 'Công nghệ',
  //   source: 'VnExpress',
  //   author: 'Nguyễn Văn A',
  //   publishedAt: 'Thứ Sáu, 20/03/2026 - 09:30 AM',
  //   contentHtml: `
  //     <p>Theo báo cáo mới nhất từ Hiệp hội Công nghiệp Bán dẫn toàn cầu, nhu cầu về kỹ sư thiết kế vi mạch dự kiến sẽ tăng gấp đôi trong vòng 5 năm tới...</p>
  //     <h2>Làn sóng dịch chuyển đầu tư</h2>
  //     <p>Hàng loạt trung tâm R&D về thiết kế vi mạch đã được mở tại Hà Nội và TP.HCM.</p>
  //     <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop" alt="Bảng mạch điện tử">
  //     <figcaption>Các kỹ sư Việt Nam đang ngày càng tham gia sâu hơn vào khâu thiết kế lõi.</figcaption>
  //   `,
  //   originalUrl: 'https://vnexpress.net/...',
  //   tags: ['Vi mạch', 'Bán dẫn', 'Công nghệ AI']
  // };

  article$ = this.newsService.currentArticle$;
  relatedNews$ = this.newsService.relatedNews$;
  aiSummary$ = this.newsService.aiSummary$;
  isSummaryLoading$ = this.newsService.isSummaryLoading$;

  constructor(
    private route: ActivatedRoute,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    // Theo dõi sự thay đổi của URL. Nếu người dùng đang ở bài A, bấm vào tin liên quan sang bài B thì route sẽ đổi
    this.route.paramMap.subscribe(params => {
      const articleId = params.get('slug');
      if (articleId) {
        this.newsService.fetchArticleDetail(articleId);
      }
    });
    // Logic fetch bài viết thường để ở đây (dùng ActivatedRoute để lấy ID)
  }

  // Khi click nút Tóm tắt
  generateAiSummary(articleId: string): void {
    this.newsService.fetchAiSummary(articleId);
  }

}