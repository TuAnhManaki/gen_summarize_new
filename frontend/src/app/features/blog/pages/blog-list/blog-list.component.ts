import { Component, OnInit, OnDestroy } from '@angular/core';
import { NewsService } from '../../services/News.Service';
import { HomeOverviewResponse, PageData, Article } from '../../models/blog.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-blog-list',
    templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss']
})
export class BlogListComponent implements OnInit, OnDestroy {
  // --- STATE ---
  overviewData: HomeOverviewResponse | null = null;
  feedData: PageData<Article> | null = null;
  
  // --- FILTER & PAGINATION ---
  currentPage: number = 0;
  currentSources: string[] = ['vnexpress', 'genk'];
  availableSources: string[] = ['vnexpress', 'genk'];
  pagesArray: number[] = [];

  private destroy$ = new Subject<void>();

  constructor(public newsService: NewsService) {}

  ngOnInit(): void {
    // Gọi API khi component khởi tạo
    this.newsService.fetchHomeOverview();
    this.loadFeed();

    // Lắng nghe dữ liệu Overview
    this.newsService.overview$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.overviewData = data;
      });

    // Lắng nghe dữ liệu Feed và tạo mảng phân trang
    this.newsService.feed$
      .pipe(takeUntil(this.destroy$))
      .subscribe(data => {
        this.feedData = data;
        if (data) {
          this.calculatePages(data.totalPages, data.number);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // --- ACTIONS ---

  onPageClick(page: number): void {
    if (this.feedData && page >= 0 && page < this.feedData.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadFeed();
      // Cuộn lên đầu phần Feed khi chuyển trang
      const element = document.getElementById('news-start');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  toggleSource(source: string): void {
    if (this.currentSources.includes(source)) {
      this.currentSources = this.currentSources.filter(s => s !== source);
    } else {
      this.currentSources.push(source);
    }
    this.currentPage = 0; // Reset về trang 1 khi lọc
    this.loadFeed();
  }

  private loadFeed(): void {
    this.newsService.fetchFeed(this.currentPage, 10, this.currentSources);
  }

  private calculatePages(totalPages: number, currentPage: number): void {
    this.pagesArray = [];
    if (totalPages === 0) return;

    let start = Math.max(0, currentPage - 2);
    let end = Math.min(totalPages - 1, currentPage + 2);

    for (let i = start; i <= end; i++) {
      this.pagesArray.push(i);
    }
  }
}