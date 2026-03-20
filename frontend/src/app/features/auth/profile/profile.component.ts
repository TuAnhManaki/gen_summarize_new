import { Component, OnInit } from '@angular/core';
import { UserProfile } from '@app/core/models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  
  // Khởi tạo dữ liệu mẫu
  user: UserProfile = {
    id: 'U001',
    username: 'dev_angular_15',
    email: 'contact@example.com',
    fullName: 'Nguyễn Văn A',
    avatarUrl: 'https://i.pravatar.cc/150?img=11', // Ảnh mẫu random
    role: 'Full-stack Developer',
    bio: 'Lập trình viên đam mê Angular và Java Spring Boot. Thích tìm hiểu về Tailwind CSS.',
    joinDate: new Date('2023-01-15')
  };

  constructor() {}

  ngOnInit(): void {}

  onEditProfile(): void {
    console.log('Chức năng chỉnh sửa đang được phát triển...');
    // Logic mở modal hoặc chuyển trang edit
  }
}