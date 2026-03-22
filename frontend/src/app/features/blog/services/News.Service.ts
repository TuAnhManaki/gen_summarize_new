import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { HomeOverviewResponse, PageData, Article, CategoryOverviewResponse } from '../models/blog.model';
import { environment } from '@env/environment';
import { ArticleDetail } from '../pages/blog-detail/blog-detail.component';

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly API_URL = environment.apiServeUrl + '/api/v1/news';

  // ==========================================
  // 1. KHAI BÁO BEHAVIOR SUBJECTS
  // ==========================================

  private overviewSubject = new BehaviorSubject<HomeOverviewResponse | null>(null);
  public overview$: Observable<HomeOverviewResponse | null> = this.overviewSubject.asObservable();

  private feedSubject = new BehaviorSubject<PageData<Article> | null>(null);
  public feed$: Observable<PageData<Article> | null> = this.feedSubject.asObservable();

  private loadingSubject = new BehaviorSubject<boolean>(false);
  public isLoading$: Observable<boolean> = this.loadingSubject.asObservable();

  private errorSubject = new BehaviorSubject<string | null>(null);
  public error$: Observable<string | null> = this.errorSubject.asObservable();

    // 2. CÁC HÀM GỌI API & CẬP NHẬT Detail 
  private currentArticleSubject = new BehaviorSubject<ArticleDetail | null>(null);
  public currentArticle$: Observable<ArticleDetail | null> = this.currentArticleSubject.asObservable();
  
  private relatedNewsSubject = new BehaviorSubject<Article[]>([]);
  public relatedNews$: Observable<Article[]> = this.relatedNewsSubject.asObservable();

  private aiSummarySubject = new BehaviorSubject<string | null>(null);
  public aiSummary$: Observable<string | null> = this.aiSummarySubject.asObservable();

  private summaryLoadingSubject = new BehaviorSubject<boolean>(false);
  public isSummaryLoading$: Observable<boolean> = this.summaryLoadingSubject.asObservable();

  // ==========================================
  // 3. STATE CHO TRANG CHUYÊN MỤC (MỚI THÊM)
  // ==========================================
  
  // State chứa phần Tổng quan (Hero, Popular, Filters)
  private categoryOverviewSubject = new BehaviorSubject<CategoryOverviewResponse | null>(null);
  public categoryOverview$: Observable<CategoryOverviewResponse | null> = this.categoryOverviewSubject.asObservable();

  // State chứa danh sách Feed phân trang ở dưới
  private categoryFeedSubject = new BehaviorSubject<PageData<Article> | null>(null);
  public categoryFeed$: Observable<PageData<Article> | null> = this.categoryFeedSubject.asObservable();
  
  // Ở Angular 15, thường chuộng Constructor Injection hơn
  constructor(private http: HttpClient) {}

  // ==========================================
  // 2. CÁC HÀM GỌI API & CẬP NHẬT SUBJECTS
  // ==========================================

  fetchHomeOverview(): void {
    if (this.overviewSubject.getValue()) return; // Cache

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    this.http.get<HomeOverviewResponse>(`${this.API_URL}/home/overview`)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (response) => this.overviewSubject.next(response),
        error: (err) => {
          console.error('Lỗi Overview:', err);
          this.errorSubject.next('Không thể tải dữ liệu trang chủ lúc này.');
        }
      });
  }
  
  fetchFeed(page: number = 0, size: number = 10, sources: string[] = [], categories: string[] = [] ): void {
    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sources && sources.length > 0) {
      params = params.set('sources', sources.join(','));
    }

    if (categories && categories.length > 0) {
      params = params.set('categories', categories.join(','));
    }

    console.log('Gọi API với params:', params.toString());
    this.http.get<PageData<Article>>(`${this.API_URL}/feed`, { params })
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (response) => this.feedSubject.next(response),
        error: (err) => {
          console.error('Lỗi Feed:', err);
          this.errorSubject.next('Không thể tải danh sách tin tức.');
        }
      });
  }

    // ==========================================
  // 2. CÁC HÀM GỌI API & CẬP NHẬT Detail 
  // ==========================================

  // 1. Lấy chi tiết bài viết
  fetchArticleDetail(id: string): void {
    // Xóa state cũ khi vào bài mới
    this.currentArticleSubject.next(null); 
    this.aiSummarySubject.next(null); 
    
    // Bạn có thể dùng this.loadingSubject có sẵn của bạn để báo loading toàn trang
    this.http.get<ArticleDetail>(`${this.API_URL}/${id}`)
      .subscribe({
        next: (response) => {
          this.currentArticleSubject.next(response);
          // Lấy luôn tin liên quan sau khi có chi tiết bài viết
          this.fetchRelatedNews(id);
        },
        error: (err) => console.error('Lỗi chi tiết:', err)
      });
  }

// 2. Lấy danh sách tin liên quan
fetchRelatedNews(id: string): void {
  this.relatedNewsSubject.next([]); // Xóa cũ
  this.http.get<Article[]>(`${this.API_URL}/${id}/related`)
    .subscribe({
      next: (response) => this.relatedNewsSubject.next(response),
      error: (err) => console.error('Lỗi tin liên quan:', err)
    });
}

// 3. Tóm tắt AI
fetchAiSummary(id: string): void {
  if (this.aiSummarySubject.getValue() || this.summaryLoadingSubject.getValue()) return; // Cache

  this.summaryLoadingSubject.next(true);

  this.http.post<{ summary: string }>(`${this.API_URL}/${id}/summarize`, {})
    .pipe(finalize(() => this.summaryLoadingSubject.next(false)))
    .subscribe({
      next: (response) => {
        this.aiSummarySubject.next(response?.summary ?? 'Rất tiếc, AI đang bận. Vui lòng thử lại sau!');
      },
      error: (err) => {
        console.error('Lỗi API AI:', err);
        this.aiSummarySubject.next('Rất tiếc, AI đang bận. Vui lòng thử lại sau!');
      }
    });
}

    // ==========================================
  // 2. CÁC HÀM GỌI API & CẬP NHẬT categorySlug 
  // ==========================================
/**
   * API 1: Lấy tổng quan chuyên mục (Hero, Đọc nhiều, Bộ lọc)
   * Trả về đúng cục JSON bạn vừa cung cấp
   */
fetchCategoryOverview(categorySlug: string): void {
  // Xóa state cũ khi chuyển sang Category khác
  this.categoryOverviewSubject.next(null); 
  
  this.http.get<CategoryOverviewResponse>(`${this.API_URL}/category/${categorySlug}`)
    .subscribe({
      next: (response) => this.categoryOverviewSubject.next(response),
      error: (err) => console.error('Lỗi khi tải tổng quan Category:', err)
    });
}
/**
   * API 2: Lấy danh sách Feed phân trang
   * Trả về PageData<Article>
   */
fetchCategoryFeed(page: number = 0, size: number = 10, sources: string[] = [], categories: string[] = []): void {
  // Bạn có thể dùng một loading subject nhỏ ở đây nếu muốn hiện spinner cho phần feed
  let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (sources && sources.length > 0) {
      params = params.set('sources', sources.join(','));
    }

    if (categories && categories.length > 0) {
      params = params.set('categories', categories.join(','));
    }

  this.http.get<PageData<Article>>(`${this.API_URL}/feed`, { params })
    .subscribe({
      next: (response) => this.categoryFeedSubject.next(response),
      error: (err) => console.error('Lỗi khi tải Feed phân trang Category:', err)
    });
  
}


    // ==========================================
  //  CÁC HÀM GỌI API & CẬP NHẬT Header categorySlug 
  // ==========================================

// Khai báo state cho Categories
private categoriesSubject = new BehaviorSubject<any[]>([]);
public categories$ = this.categoriesSubject.asObservable();

fetchCategories(): void {
  // Nếu đã có data thì không gọi lại API nữa (Cache)
  if (this.categoriesSubject.getValue().length > 0) return;

  this.http.get<any[]>(`${environment.apiServeUrl}/api/v1/categories`)
    .subscribe({
      next: (data) => this.categoriesSubject.next(data),
      error: (err) => console.error('Lỗi khi lấy danh mục:', err)
    });
}
}