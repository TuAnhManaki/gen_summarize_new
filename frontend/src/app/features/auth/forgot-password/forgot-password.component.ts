
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;
  isSubmitting = false;
  isSent = false; // Biến kiểm soát trạng thái đã gửi thành công hay chưa

  constructor(private fb: FormBuilder,
    private location: Location,
  ) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotForm.valid) {
      this.isSubmitting = true;
      
      // Giả lập gọi API gửi mail (đợi 1.5s)
      setTimeout(() => {
        console.log('Đã gửi yêu cầu reset tới:', this.forgotForm.value.email);
        this.isSubmitting = false;
        this.isSent = true; // Chuyển sang màn hình thông báo thành công
      }, 1500);
    } else {
      this.forgotForm.markAllAsTouched();
    }
  }

  // Hàm để reset lại nếu người dùng nhập sai email và muốn nhập lại
  tryAgain() {
    this.isSent = false;
    this.forgotForm.reset();
  }

  goBack() {
    this.location.back();
  }

}