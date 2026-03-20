import { Component, OnInit, OnDestroy } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, takeUntil } from "rxjs"; // 1. Import RxJS

import { Exercise, GrammarItem, TenseLesson, TENSES_LIST } from "@app/core/models/grammar.model";
import { ApiService } from "@app/core/services/api.service";
import { ToastService } from "@app/core/toast/service/toast.service";
import { AudioService } from "@app/core/services/audio.service";

@Component({
  selector: "app-tense-detail",
  templateUrl: "./tense-detail.component.html",
  styleUrls: ["./tense-detail.component.scss"],
})
export class TenseDetailComponent implements OnInit, OnDestroy {

  grammarDetail?: GrammarItem;
  exercises: Exercise[] = [];
  currentSection: string = "usage";

  currentSlug: string | null = '';
  nextLesson: TenseLesson | null = null;

  // Observer & Subject để quản lý bộ nhớ
  private observer: IntersectionObserver | null = null;
  private destroy$ = new Subject<void>(); // 2. Biến quản lý hủy subscription

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private toast: ToastService,
    private audioService: AudioService,
  ) {}


  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.currentSlug = params.get('slug');
      this.calculateNextLesson();
          this.getgrammars(this.currentSlug);

    });
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

  getgrammars( slug: string | null) {

    this.api
      .get<GrammarItem>("/api/v1/grammars/" + slug)
      .pipe(takeUntil(this.destroy$)) // Tự động hủy nếu user thoát trang
      .subscribe({
        next: (data: GrammarItem) => {
          this.grammarDetail = data;
          this.exercises = data.overview.exercises;

          // 4. QUAN TRỌNG: Gọi ScrollSpy sau khi dữ liệu đã về và HTML đã render
          // setTimeout 0ms để đẩy xuống cuối hàng đợi event loop, chờ Angular render xong *ngIf
          setTimeout(() => {
            this.setupScrollSpy();
          }, 100);
        },
        error: (err) => {
          // Xử lý message lỗi an toàn
          const msg = err.error?.message || err.message || "Lỗi không xác định";
          this.toast.showError(`Lỗi tải bài học: ${msg}`);
        },
      });
  }

  setupScrollSpy() {
    // Ngắt observer cũ nếu có (tránh trùng lặp)
    if (this.observer) {
      this.observer.disconnect();
    }

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 0.3, // Giảm xuống 0.3 để nhạy hơn trên mobile
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          this.currentSection = entry.target.id;
        }
      });
    }, options);

    // Tìm các section sau khi HTML đã render
    const sections = document.querySelectorAll("section[id]");
    if (sections.length > 0) {
      sections.forEach((section) => {
        this.observer?.observe(section);
      });
    }
  }

  scrollTo(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition =
        elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });

      this.currentSection = sectionId;
    }
  }

  playAudio(text: string) {
    this.audioService.speak(text);
  }

  calculateNextLesson() {
    if (!this.currentSlug) return;

    // 1. Tìm vị trí bài hiện tại
    const currentIndex = TENSES_LIST.findIndex(t => t.slug === this.currentSlug);

    // 2. Kiểm tra nếu tìm thấy và chưa phải bài cuối cùng
    if (currentIndex !== -1 && currentIndex < TENSES_LIST.length - 1) {
      this.nextLesson = TENSES_LIST[currentIndex + 1];
    } else {
      this.nextLesson = null; // Hết bài hoặc không tìm thấy
    }
  }

  checkAnswer() {
    if (!this.exercises || this.exercises.length === 0) return;

    let correctCount = 0;
    let total = this.exercises.length;
    let isFullAnswer = true;

    this.exercises.forEach((ex) => {
      if (!ex.userAnswer) {
        isFullAnswer = false;
        ex.status = "wrong";
        return;
      }

      const userClean = ex.userAnswer.trim().toLowerCase();
      const answerClean = ex.answer.trim().toLowerCase();

      if (userClean === answerClean) {
        ex.status = "correct";
        correctCount++;
      } else {
        ex.status = "wrong";
      }
    });

    if (!isFullAnswer) {
      this.toast.showInfo("Bạn chưa làm hết bài tập, nhưng mình vẫn chấm nhé!");
    }

    if (correctCount === total) {
      this.toast.showSuccess(
        `Tuyệt vời! Bạn đúng ${correctCount}/${total} câu.`
      );
    } else {
      this.toast.showError(
        `Bạn đúng ${correctCount}/${total} câu. Hãy xem lại các lỗi sai màu đỏ.`
      );
    }
  }
}
