

  import { Component, Input } from '@angular/core';
  import { Router } from '@angular/router';
  
  // Định nghĩa kiểu dữ liệu cho Comment
  interface Comment {
    id: number;
    user: string;
    avatar: string;
    content: string;
    likes: number;
    time: string;
    liked: boolean;       // Trạng thái Like của user
    replies: Comment[];   // Danh sách trả lời con
    showReplyBox: boolean; // Trạng thái ẩn/hiện ô nhập trả lời
    replyText: string;    // Nội dung đang nhập trả lời
  }
  
  
@Component({
  selector: 'app-comment-section',
  templateUrl: './comment-section.component.html',
  styleUrls: ['./comment-section.component.scss']
})
  export class CommentSectionComponent {
    @Input() isLoggedIn = false;
  
    mainCommentText = '';
    showLoginPopup = false;
  
    // Dữ liệu mẫu (Có cấu trúc lồng nhau)
    comments: Comment[] = [
      {
        id: 1,
        user: 'babay2006006',
        avatar: 'B',
        content: 'Nên thiết kế nhà ga có tính văn hoá Việt và có bản sắc TP HCM.',
        likes: 58,
        time: '6h trước',
        liked: false,
        showReplyBox: false,
        replyText: '',
        replies: [
          {
            id: 101,
            user: 'Kien Truc Su',
            avatar: 'K',
            content: 'Đồng ý, cần giữ gìn bản sắc dân tộc.',
            likes: 12,
            time: '5h trước',
            liked: true,
            replies: [],
            showReplyBox: false,
            replyText: ''
          }
        ]
      },
      {
        id: 2,
        user: 'banhduc7522',
        avatar: 'Đ',
        content: 'Tui đi xe buýt từ Củ Chi xuống, kéo dài tuyến lên An Sương đi các bác ơi.',
        likes: 46,
        time: '7h trước',
        liked: true,
        showReplyBox: false,
        replyText: '',
        replies: []
      }
    ];
  
    constructor(private router: Router) {}
  
    // --- XỬ LÝ COMMENT CHÍNH ---
    onFocusInput() {
      if (!this.isLoggedIn) {
        this.showLoginPopup = true;
        document.getElementById('mainInput')?.blur();
      }
    }
  
    submitMainComment() {
      if (!this.mainCommentText.trim()) return;
      
      const newComment: Comment = {
        id: Date.now(),
        user: 'Bạn',
        avatar: 'U',
        content: this.mainCommentText,
        likes: 0,
        time: 'Vừa xong',
        liked: false,
        replies: [],
        showReplyBox: false,
        replyText: ''
      };
  
      this.comments.unshift(newComment);
      this.mainCommentText = '';
    }
  
    // --- XỬ LÝ LIKE ---
    toggleLike(item: Comment) {
      if (!this.isLoggedIn) {
        this.showLoginPopup = true;
        return;
      }
      item.liked = !item.liked;
      item.likes += item.liked ? 1 : -1;
    }
  
    // --- XỬ LÝ TRẢ LỜI (REPLY) ---
    toggleReplyBox(item: Comment) {
      if (!this.isLoggedIn) {
        this.showLoginPopup = true;
        return;
      }
      // Đảo trạng thái hiển thị ô nhập
      item.showReplyBox = !item.showReplyBox;
    }
  
    submitReply(parentComment: Comment) {
      if (!parentComment.replyText.trim()) return;
  
      const newReply: Comment = {
        id: Date.now(),
        user: 'Bạn',
        avatar: 'U',
        content: parentComment.replyText,
        likes: 0,
        time: 'Vừa xong',
        liked: false,
        replies: [],
        showReplyBox: false,
        replyText: ''
      };
  
      // Thêm vào danh sách trả lời của comment cha
      parentComment.replies.push(newReply);
      
      // Reset
      parentComment.replyText = '';
      parentComment.showReplyBox = false; // Đóng ô nhập sau khi gửi
    }
  
    goToLogin() {
      this.router.navigate(['/login']);
    }
  }