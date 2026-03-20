
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfile } from '@app/core/models/user.model';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss']

})
export class EditProfileComponent implements OnInit {
  @Input() user!: UserProfile; // Nhận dữ liệu user từ cha
  @Output() cancel = new EventEmitter<void>(); // Bắn sự kiện hủy
  @Output() save = new EventEmitter<UserProfile>(); // Bắn sự kiện lưu

  profileForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    // Khởi tạo form với dữ liệu từ @Input user
    this.profileForm = this.fb.group({
      fullName: [this.user.fullName, Validators.required],
      // birthYear: [this.user.birthYear, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear())]],
      // gender: [this.user.gender],
      email: [{ value: this.user.email, disabled: true }], // Email thường không cho sửa, set disabled
      // phoneNumber: [this.user.phoneNumber, [Validators.required, Validators.pattern(/^[0-9]{10,11}$/)]],
      // city: [this.user.city],
      // school: [this.user.school],
      // grade: [this.user.grade],
      // parentName: [this.user.parentName],
      // parentEmail: [this.user.parentEmail, Validators.email]
    });
  }

  onSubmit() {
    if (this.profileForm.valid) {
      // Gộp dữ liệu form với ID user gốc (vì form không chứa ID)
      const updatedUser: UserProfile = {
        ...this.user,
        ...this.profileForm.getRawValue() // getRawValue để lấy cả field bị disabled (email)
      };
      this.save.emit(updatedUser);
    } else {
      this.profileForm.markAllAsTouched(); // Hiện lỗi nếu form chưa valid
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}