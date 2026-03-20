
import { Component } from '@angular/core';
import {  FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

@Component({
  selector: 'app-change-password',
    templateUrl: './change-password.component.html',
    styleUrls: ['./change-password.component.scss']

})
export class ChangePasswordComponent {
  passwordForm: FormGroup;
  showSuccessMessage = false;

  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  // Validator tùy chỉnh để kiểm tra mật khẩu nhập lại có khớp không
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('newPassword')?.value;
    const confirmPass = control.get('confirmPassword')?.value;
    return newPass === confirmPass ? null : { mismatch: true };
  }

  onSubmit(): void {
    if (this.passwordForm.valid) {
      console.log('Dữ liệu form:', this.passwordForm.value);
      // Gọi API đổi mật khẩu ở đây
      
      this.showSuccessMessage = true;
      this.passwordForm.reset(); // Reset form sau khi thành công
      
      // Ẩn thông báo sau 3 giây
      setTimeout(() => this.showSuccessMessage = false, 3000);
    } else {
      this.passwordForm.markAllAsTouched(); // Hiển thị lỗi nếu người dùng bấm submit mà chưa nhập
    }
  }

  // Helper để rút ngắn code trong HTML
  get f() { return this.passwordForm.controls; }
}