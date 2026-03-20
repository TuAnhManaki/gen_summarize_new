import { Component, OnInit } from "@angular/core";
import { Title } from "@angular/platform-browser";
import { Router } from "@angular/router";
import { PageResponse } from "@app/core/models/pagination.model";
import { WordPair } from "@app/core/models/word-pair.model";
import { ApiService } from "@app/core/services/api.service";
import { AudioService } from "@app/core/services/audio.service";
import { ToastService } from "@app/core/toast/service/toast.service";

@Component({
  selector: "app-adjective-adverb",
  templateUrl: "./adjective-adverb.component.html",
  styleUrls: ["./adjective-adverb.component.scss"],
})
export class AdjectiveAdverbComponent implements OnInit {

  // pagination
  data: PageResponse<WordPair> | null = null;
  isLoading = false;


  wordList: WordPair[] = [];
  currentPage = 0;
  totalPages = 0;
  pageSize = 10;

  // Phân trang
  totalElements = 0;
  pagesArray: number[] = [];

  // Tìm kiếm & Lọc
  searchTerm: string = '';
  filterType: string = 'All'; // 'All', 'Ly', 'Special'
 
    constructor(
      private router: Router,
      private api: ApiService,
      private titleService: Title,
      private toast: ToastService,
      private audioService: AudioService
    ) {}

  ngOnInit() {
    this.titleService.setTitle('Tính từ & Trạng từ');
    this.loadData();
  }

  goToDetail(base: string) {
    this.router.navigate(["danh-muc/trang_tu_tinh_tu", base]);
  }

  /**
   * Hàm gọi API lấy dữ liệu
   */
  loadData() {
    this.isLoading = true;

    // Chuẩn bị tham số
    const params: any = {
      page: this.currentPage,
      size: this.pageSize,
    };

    if (this.filterType !== "All") {
      params.level = this.filterType; // TODO
    }

    // Nếu có search thì mới gửi param key lên
    if (this.searchTerm && this.searchTerm.trim()) {
      params.key = this.searchTerm;
    }

    this.api
      .get<PageResponse<WordPair>>("/api/v1/adjective-adverbs", params)
      .subscribe({
        next: (res) => {
          this.wordList = res.items;
          this.data = res;
          this.isLoading = false;

          this.pagesArray = Array.from(
            { length: res.totalPages },
            (_, i) => i + 1
          );
        },
        error: (err) => {
          const msg = err.error?.message || err.message || "Lỗi không xác định";
          this.toast.showError(`Lỗi tải bài học: ${msg}`);
          this.isLoading = false;
        }
      });
  }

  onSearch(): void {
    this.currentPage = 0; // Reset về trang đầu khi tìm kiếm
    this.loadData();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadData();
    }
  }

  generatePagesArray(): void {
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i);
  }

  // Hàm đọc văn bản (Xóa thẻ HTML trước khi đọc)
  speak(text: string): void {
    if (!text) return;
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=en&client=tw-ob`;
    const audio = new Audio(url);
    audio.play().catch(() => {
        // Fallback nếu API Google bị chặn
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = 'en-US';
            window.speechSynthesis.speak(msg);
        }
    });
  }

  speak2(text: string): void {
    this.audioService.speak(text);
  }

}
