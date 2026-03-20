import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Lesson } from '@app/core/models/lesson.model';
import { ApiService } from '@app/core/services/api.service';
import { ToastService } from '@app/core/toast/service/toast.service';
import { catchError, of, Subject, takeUntil } from 'rxjs';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-lesson-list',
  templateUrl: './lesson-list.component.html',
  styleUrls: ['./lesson-list.component.scss']
})
export class LessonListComponent {

  lessons: Lesson[] = [];
  currentPage = 0;
  pageSize = 6;
  level = '';
  currentLevel: string = '';
  totalElements = 0;
  totalPages = 0;
  isLoading = false;
  totalLesson = 0;
  totalCompleted = 0;
  isFirstLoad = false;

  // Danh sách levels để hiển thị ra UI
  levels = [
    { label: 'Tất cả', value: '' },
    { label: 'Beginner', value: 'BEGINNER' },
    { label: 'Intermediate', value: 'INTERMEDIATE' },
    { label: 'Advanced', value: 'ADVANCED' }
  ];

  private destroy$ = new Subject<void>();

  constructor(private apiService: ApiService, private toast: ToastService, private router: Router) {}

  ngOnInit(): void {
    this.loadLessons();
  }

  loadLessons(): void {
  const params: any = {
    page: this.currentPage,
    size: this.pageSize
  };

  if (this.currentLevel) {
    params.level = this.currentLevel;
  }

  this.isLoading = true;

  forkJoin({
    // API Public: Nếu lỗi (ví dụ 401 do token cũ), vẫn trả về null để không crash forkJoin
    lessonsRes: this.apiService.get<any>('/api/v1/lessons', params).pipe(
      catchError(err => {
        console.error('Lỗi tải lessons:', err);
        return of(null); 
      })
    ),
    // API Private: Nếu lỗi (chưa đăng nhập/token hết hạn), trả về mảng rỗng []
    progressRes: this.apiService.get<any[]>('/api/v1/user-learning-progess/user-progress').pipe(
      catchError(err => {
        console.warn('Không thể lấy tiến độ (chưa login hoặc lỗi):', err);
        return of([]); 
      })
    )
  })
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: ({ lessonsRes, progressRes }) => {
      this.isLoading = false;

      // Nếu cả lessonsRes cũng null thì báo lỗi cho người dùng
      if (!lessonsRes) {
        this.toast.showError('Không thể tải danh sách bài học');
        return;
      }

      const lessonItems = lessonsRes.items || [];
      const progressData = progressRes || [];

      // Map trạng thái vào từng bài học
      this.lessons = lessonItems.map((lesson: any) => {
        const progress = progressData.find(p => p.lessonId === lesson.id);
        return {
          ...lesson,
          status: progress ? progress.status : 'NOT_STARTED'
        };
      });

      if (!this.isFirstLoad) {
        this.isFirstLoad = true;
        this.totalLesson = lessonsRes.totalElements;
      }

      this.totalPages = lessonsRes.totalPages;
      this.totalElements = lessonsRes.totalElements;
      this.totalCompleted = progressData.filter(p => p.status === 'COMPLETED').length;
    },
    error: (_err) => {
      this.isLoading = false;
      this.toast.showError('Có lỗi hệ thống xảy ra');
    }
  });
}

  onLevelChange(level: string): void {
    this.currentLevel = level;
    this.currentPage = 0; // Reset về trang đầu khi đổi filter
    this.loadLessons();
  }

  // Tạo mảng số trang để hiển thị ra giao diện
  get totalPagesArray(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadLessons();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goToLessonDetail(code: string): void {
    // 1. Bạn có thể xử lý thêm logic ở đây
    console.log('Đang bắt đầu bài học có mã:', code);
    
    // Ví dụ: Lưu vào LocalStorage bài học vừa xem gần nhất
    localStorage.setItem('last_lesson', code);

    // 2. Thực hiện điều hướng
    // Sẽ chuyển đến: /danh-sach-bai-hoc/DAY-22
    this.router.navigate(['/danh-muc/danh-sach-bai-hoc', code]);
  }

}

