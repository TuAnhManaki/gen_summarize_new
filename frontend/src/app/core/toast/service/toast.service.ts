import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  // Biến lưu danh sách các thông báo đang hiện
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  toasts$ = this.toastsSubject.asObservable();

  private counter = 0;

  constructor() { }

  // Hàm gọi chung
  show(type: Toast['type'], title: string, message: string, duration: number = 4000) {
    const id = this.counter++;
    const newToast: Toast = { id, type, title, message };
    
    // Thêm vào danh sách hiện tại
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Tự động tắt sau 'duration' giây
    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  // Các hàm tiện ích gọi cho nhanh
  showSuccess(msg: string) { this.show('success', 'Thành công!', msg); }
  showError(msg: string) { this.show('error', 'Đã có lỗi!', msg); }
  showInfo(msg: string) { this.show('info', 'Thông tin', msg); }
  showWarning(msg: string) { this.show('warning', 'Thông tin', msg); }

  getErrorMessage(msg: string, err: any) {
    const errorMessage = err.error?.message || err.error || err.message || 'Lỗi không xác định';

    this.show('error', 'Đã có lỗi!', msg +` ${errorMessage}`);

  }
  // Hàm xóa thông báo (khi user click nút X hoặc hết giờ)
  remove(id: number) {
    const currentToasts = this.toastsSubject.value;
    const updatedToasts = currentToasts.filter(t => t.id !== id);
    this.toastsSubject.next(updatedToasts);
  }
}