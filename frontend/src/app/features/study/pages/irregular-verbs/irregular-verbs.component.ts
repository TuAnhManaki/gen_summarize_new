import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PageResponse } from "@app/core/models/pagination.model";
import { verb } from "@app/core/models/verb.model";
import { ApiService } from "@app/core/services/api.service";
import { AudioService } from "@app/core/services/audio.service";
import { ToastService } from "@app/core/toast/service/toast.service";
import { Subject, takeUntil } from "rxjs";

export interface IrregularVerb {
  v1: string;
  v2: string;
  v3: string;
  level: "B" | "I" | "A"; // Beginner, Intermediate, Advanced
  meaning: string;
  example: string;
  exampleHtml: string; // Chứa thẻ <b> để bôi đậm
}
@Component({
  selector: "app-irregular-verbs",
  templateUrl: "./irregular-verbs.component.html",
  styleUrls: ["./irregular-verbs.component.scss"],
})
export class IrregularVerbsComponent implements OnInit {
  selectedLevel = "ALL";

  // Data
  data: PageResponse<verb> | null = null;
  verbs: verb[] = [];

  // Filter States
  currentPage = 0;
  pageSize = 10;
  pagesArray: number[] = [];

  // pagination
  totalPage = 0;
  totalPages = 0;

  // Observer & Subject để quản lý bộ nhớ
  private observer: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>(); // 2. Biến quản lý hủy subscription

  constructor(
    private router: Router,
    private api: ApiService,
    private toast: ToastService,
    private audioService: AudioService
  ) {}

  ngOnInit() {
    this.loadData(this.totalPage);
  }

  // Cleanup khi thoát component
  ngOnDestroy() {
    this.audioService.stop();

    // Hủy API đang chạy dở
    this.destroy$.next();
    this.destroy$.complete();

    // Hủy Observer ScrollSpy
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  goToDetail(base: string) {
    this.router.navigate(["/danh-muc/bat_dong_tu", base]);
  }

  // Debounce Search
  isLoading = false;

  loadData(page: number): void {
    this.isLoading = true;
    // Chuẩn bị tham số
    const params: any = {
      page: page, // API SpringBoot thường bắt đầu từ 0
      size: this.pageSize,
    };

    // Nếu chọn level khác 'ALL' thì mới gửi param level lên
    if (this.selectedLevel !== "ALL") {
      params.level = this.selectedLevel;
    }

    // Nếu có search thì mới gửi param key lên
    if (this.searchTerm && this.searchTerm.trim()) {
      params.key = this.searchTerm;
    }

    this.api
      .get<PageResponse<verb>>("/api/v1/verbs", params)
      .pipe(takeUntil(this.destroy$)) // Tự động hủy nếu user thoát trang
      .subscribe({
        next: (response) => {
          this.data = response;
          this.verbs = response.items;
          this.isLoading = false;
        },
        error: (err) => {
          const msg = err.error?.message || err.message || "Lỗi không xác định";
          this.toast.showError(`Lỗi tải bài học: ${msg}`);
          this.isLoading = false;
        },
      });
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.loadData(page);
    }
  }

  generatePagesArray() {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  // --- Events ---

  // Biến cho Search & Filter
  searchTerm: string = "";

  // Hàm xử lý tìm kiếm và lọc
  onFilter(): void {
    this.searchTerm = this.searchTerm.toLowerCase().trim();

    this.loadData(0);
  }

  // Hàm đọc âm thanh (Logic từ HTML gốc chuyển sang TS)
  speak(text: string): void {
    this.audioService.speak(text);
  }
}
