import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PageResponse } from "@app/core/models/pagination.model";
import { StructureItem } from "@app/core/models/structure.model";
import { ApiService } from "@app/core/services/api.service";
import { ToastService } from "@app/core/toast/service/toast.service";


@Component({
  selector: "app-structures",
  templateUrl: "./structures.component.html",
  styleUrls: ["./structures.component.scss"],
})
export class StructuresComponent implements OnInit {
  structures: StructureItem[] = [];

  // Các biến phân trang
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 1;
  totalElements: number = 0;

  isLoading: boolean = false;
  pagesArray: number[] = [];

  constructor(private api: ApiService, private toast: ToastService, private router: Router, 
    
  ) {}

  ngOnInit(): void {
    this.loadData(this.currentPage);
  }

  loadData(page: number) {
    this.isLoading = true;

    // Gọi service với page và size
    this.api
      .get<PageResponse<StructureItem>>("/api/v1/sentence-structures", {
        page: page,
        size: this.pageSize,
      })
      .subscribe({
        next: (res: PageResponse<StructureItem>) => {

          // === CẬP NHẬT THEO DATA API MỚI ===
          this.structures = res.items; // Lấy list từ 'items'          
          this.currentPage = res.page; // Page hiện tại
          this.totalPages = res.totalPages; // Tổng số trang
          this.totalElements = res.totalElements; // Tổng số bản ghi (nếu cần hiển thị)

          this.generatePagesArray();
          this.isLoading = false;

          // Scroll lên đầu khi đổi trang
          if (page > 1) {
            const header = document.querySelector(".page-header");
            if (header) header.scrollIntoView({ behavior: "smooth" });
          }
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

  speak(text: string): void {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      this.toast.showError(`Trình duyệt không hỗ trợ đọc văn bản.`);
    }
  }

  goToDetail(base: string) {
    this.router.navigate(["danh-muc/ngu_phap", base]);
  }
}
