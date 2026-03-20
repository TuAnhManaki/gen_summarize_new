import { Component, OnInit } from '@angular/core';
import { Toast, ToastService } from './service/toast.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrls: ['./toast.component.scss']
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {}

  ngOnInit() {
    // Đăng ký nhận dữ liệu từ service
    this.toastService.toasts$.subscribe(data => {
      this.toasts = data;
    });
  }

  close(id: number) {
    this.toastService.remove(id);
  }
}