
  import { DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { environment } from '@env/environment';

export interface Article {
  id: number;
  title: string;
  category: string;
  date: string;
  image: string;
  excerpt?: string;
  author?: string;
  views?: number;
  comments?: number;
  isSponsored?: boolean;
}
@Component({
  selector: 'app-blog-feed',
  templateUrl: './blog-feed.component.html',
  styleUrls: ['./blog-feed.component.scss']
})
export class BlogFeedComponent implements OnInit {

  // Dữ liệu hiển thị
  trendingTopics: string[] = [];
  featuredPosts: any[] = [];
  recentHighlightPosts: any[] = [];
  latestNews: any[] = [];
  hotNews: any[] = [];
  trendingTags: string[] = [];

    private baseUrl = environment.apiServeUrl;
  
  // Phân trang
  currentPage: number = 0;
  totalPages: number = 0;
  isLoadingNews: boolean = false;

  constructor(private http: HttpClient, private datePipe: DatePipe) {}

   // Hàm lấy Token từ LocalStorage
    private getHeaders(): HttpHeaders {
      const token = localStorage.getItem('access_token'); // Lấy token đã lưu khi login
      return new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
    }
    
    
  ngOnInit(): void {
    // 1. Gọi API Home Aggregated (Lấy tất cả dữ liệu lần đầu)
    this.http.get<any>(`${this.baseUrl}/api/v1/home-post`,{ headers: this.getHeaders()}).subscribe(data => {
      this.trendingTopics = data.trendingTopics;
      
      // Map dữ liệu Backend sang cấu trúc phẳng cho HTML dễ dùng
      this.featuredPosts = data.featuredPosts.map((p: any) => this.transformPost(p));
      this.recentHighlightPosts = data.weeklyTop.map((p: any) => this.transformPost(p));
      this.hotNews = data.sidebar.hotNews.map((p: any) => this.transformPost(p));
      this.trendingTags = data.sidebar.trendingTags;

      // Xử lý Latest News ban đầu
      this.handleNewsResponse(data.latestNews);
    });
  }

  // 2. Hàm gọi khi bấm chuyển trang (Chỉ load lại Latest News)
  onPageChange(page: number): void {
    if (page < 0 || page >= this.totalPages) return;
    
    this.isLoadingNews = true;
    this.http.get<any>(`${this.baseUrl}/api/v1/home-post?page=${page}&size=10`,{ headers: this.getHeaders()}).subscribe(res => {
      this.handleNewsResponse(res);
      this.isLoadingNews = false;
      // Scroll xuống tiêu đề Latest News
      document.getElementById('latest-news-anchor')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // Helper: Xử lý response phân trang
  private handleNewsResponse(newsData: any) {
    this.latestNews = newsData.items.map((p: any) => this.transformPost(p));
    this.currentPage = newsData.page;
    this.totalPages = newsData.totalPages;
  }

  // Helper: Biến đổi object Backend lồng nhau thành object phẳng cho View
  private transformPost(post: any) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug, // Dùng để tạo link
      category: post.categoryName || 'General',
      // Format ngày: 2026-01-18T... -> Jan 18, 2026
      date: this.datePipe.transform(post.createdAt, 'MMM dd, yyyy'), 
      // Lấy ảnh từ metadata, nếu null thì dùng ảnh placeholder
      image: post.metaData?.thumbnail || 'https://placehold.co/600x400?text=No+Image',
      excerpt: post.metaData?.summary || '',
      views: post.metaData?.stats?.views || 0
    };
  }
  
  // Helper: Tạo mảng số trang để loop trong HTML (ví dụ: [0, 1, 2])
  get pageNumbers(): number[] {
    return Array(this.totalPages).fill(0).map(( i) => i);
  }
}