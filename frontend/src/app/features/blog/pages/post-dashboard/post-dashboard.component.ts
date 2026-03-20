import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-post-dashboard',
  templateUrl: './post-dashboard.component.html',
  styleUrls: ['./post-dashboard.component.scss']
})
export class PostDashboardComponent implements OnInit {
  
  // 1. Thống kê tổng quan
  stats = {
    totalPosts: 124,
    totalViews: 45200,
    totalComments: 850,
    pendingComments: 12
  };

  // 2. Bài viết phổ biến (Top Trending)
  popularPosts = [
    { title: 'Lộ trình học Angular 17', views: 1200, likes: 350 },
    { title: 'Spring Boot 3 có gì mới?', views: 980, likes: 210 },
    { title: 'Tối ưu hiệu năng Database', views: 850, likes: 180 },
    { title: 'Deploy ứng dụng lên Docker', views: 720, likes: 150 },
  ];

  // 3. Bình luận mới nhất
  recentComments = [
    { user: 'Minh Tuấn', content: 'Bài viết rất hay, cảm ơn ad!', time: '5 phút trước' },
    { user: 'Hồng Hạnh', content: 'Cho mình hỏi về phần JWT...', time: '30 phút trước' },
    { user: 'Dev Dạo', content: 'Code này chưa tối ưu lắm...', time: '1 giờ trước' },
  ];

  constructor() {}

  ngOnInit(): void {
    // Sau này gọi Service để load dữ liệu thật ở đây
  }
}