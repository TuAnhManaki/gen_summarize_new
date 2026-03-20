import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subject, takeUntil, map, finalize } from "rxjs"; // Import thêm finalize

import { GrammarCard, GrammarItem } from "@app/core/models/grammar.model";
import { ApiService } from "@app/core/services/api.service";
import { ToastService } from "@app/core/toast/service/toast.service";

@Component({
  selector: "app-tenses",
  templateUrl: "./tenses.component.html",
  styleUrls: ["./tenses.component.scss"],
})
export class TensesComponent implements OnInit, OnDestroy {
  grammarList: GrammarCard[] = [];
  
  // 1. Biến trạng thái loading để hiển thị spinner ngoài UI
  isLoading: boolean = false; 

  // 2. Subject để hủy subscription
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService, private toast: ToastService) {}

  ngOnInit() {
    this.getgrammars();
  }

  // 3. Cleanup khi component bị hủy
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getgrammars() {
    this.isLoading = true; // Bắt đầu loading

    interface ApiResponse {
      items: GrammarItem[];
    }

    this.api
      .get<ApiResponse>("/api/v1/grammars", { page: 0, size: 12 })
      .pipe(
        // Tự động hủy nếu user thoát trang
        takeUntil(this.destroy$),
        
        // Map dữ liệu
        map((response) => {
          return response.items.map((item) => {
            return {
              slug: item.code, // Giả sử item.code là slug dùng cho routerLink
              title: item.title,
              description: item.description,
              badge: item.badge,
              whenToUse: item.overview.whenToUse,
              affirmative: item.overview.structures.affirmative,
              example: item.overview.examples,
            } as GrammarCard;
          });
        }),
        
        // Chạy khi hoàn tất (dù thành công hay thất bại) để tắt loading
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (data: GrammarCard[]) => {
          this.grammarList = data;
        },
        error: (err) => {
          // Xử lý lỗi an toàn
          const msg = err.error?.message || err.message || 'Lỗi kết nối';
          this.toast.showError(`Lỗi tải danh sách: ${msg}`);
        },
      });
  }
}