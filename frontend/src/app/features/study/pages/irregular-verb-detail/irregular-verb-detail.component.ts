import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { verb } from "@app/core/models/verb.model";
import { ApiService } from "@app/core/services/api.service";
import { AudioService } from "@app/core/services/audio.service";
import { ToastService } from "@app/core/toast/service/toast.service";
import { Subject } from "rxjs";

@Component({
  selector: "app-irregular-verb-detail",
  templateUrl: "./irregular-verb-detail.component.html",
  styleUrls: ["./irregular-verb-detail.component.scss"],
})
export class IrregularVerbDetailComponent implements OnInit {
  verbData: verb | null = null;
  isLoading = true;

  userAnswers: { [key: number]: { selected: string; isCorrect: boolean } } = {};

  // Observer & Subject để quản lý bộ nhớ
  private observer: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>(); // 2. Biến quản lý hủy subscription

  constructor(
    private route: ActivatedRoute,
    private api: ApiService,
    private toast: ToastService,
    private audioService: AudioService
  ) {}
  
  ngOnInit(): void {
    const verb = this.route.snapshot.paramMap.get("verb");

    if (verb) this.getVerbDetail(verb);
    else this.toast.showError(`Lỗi tải bài học không nhận param`);
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

  getVerbDetail(word: string) {
    this.isLoading = true;

    this.api.get<verb>("/api/v1/verbs/:word", { word: word }).subscribe({
      next: (res) => {
        this.verbData = res;
        this.isLoading = false;
      },
      error: (err) => {
        const msg = err.error?.message || err.message || "Lỗi không xác định";
        this.toast.showError(`Lỗi tải bài học: ${msg}`);
        this.isLoading = false;
      },
    });
  }
  // Hàm kiểm tra đáp án
  checkAnswer(exerciseIndex: number, option: string): void {
    if (!this.verbData) return;

    const correctAnswer = this.verbData.detail.exercises[exerciseIndex].answer;
    const isCorrect = option === correctAnswer;

    // Lưu lại trạng thái để update giao diện (đổi màu xanh/đỏ)
    this.userAnswers[exerciseIndex] = {
      selected: option,
      isCorrect: isCorrect,
    };

    // Nếu đúng có thể phát âm thanh chúc mừng (optional)
  }

  // Helper để check xem option này có được chọn hay không và đúng hay sai
  getOptionClass(exerciseIndex: number, option: string): string {
    const answerState = this.userAnswers[exerciseIndex];

    // Chưa trả lời thì không có class gì
    if (!answerState) return "";

    // Nếu đây là option người dùng ĐÃ chọn
    if (answerState.selected === option) {
      return answerState.isCorrect ? "correct" : "wrong";
    }

    return "";
  }

  // Hàm phát âm thanh (Web Speech API + Fallback Google)
  speak(text: string): void {
    this.audioService.speak(text);
  }
}
