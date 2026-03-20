import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { StructureItem } from "@app/core/models/structure.model";
import { ApiService } from "@app/core/services/api.service";

@Component({
  selector: "app-structure-detail",
  templateUrl: "./structures-detail.component.html",
  styleUrls: ["./structures-detail.component.scss"],
})
export class StructuresDetailComponent implements OnInit {
  isLoading = true;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get("slug") ?? "";
      if (!slug) {
        console.warn("Lesson not found:", slug);
      }
      this.getList(slug);
    });
  }

  structures?: StructureItem;

  // Pagination state
  currentPage = 0;
  pageSize = 10;
  totalElements = 0;

  constructor(private api: ApiService, private route: ActivatedRoute) {}

  getList(slug: string) {
    this.api
      .get<StructureItem>("/api/v1/sentence-structures/" + slug, {
        page: this.currentPage,
        size: this.pageSize,
      })
      .subscribe({
        next: (res) => {
          this.structures = res;
this.isLoading = false;
        },
        error: (err) => {console.error("Lỗi tải dữ liệu:", err)
        this.isLoading = false;}
      });
  }
  // Hàm đọc văn bản (Sử dụng Web Speech API chuẩn thay vì Google Translate)
  speak(text: string): void {
    if ("speechSynthesis" in window) {
      // Hủy các lệnh đọc cũ nếu đang đọc dở
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US"; // Giọng Mỹ
      utterance.rate = 0.9; // Tốc độ vừa phải
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Trình duyệt không hỗ trợ tính năng đọc.");
    }
  }
}
