import { Injectable } from '@angular/core';
import { of } from 'rxjs';

// Interface cho các Widget
export interface WidgetPost {
  id: string;
  title: string;
  thumbnail: string;
  date: string;
}

export interface SocialStat {
  platform: string;
  count: string;
  unit: string; // 'Fans', 'Subs'
  icon: string;
  color: string;
}

export interface CommentWidget {
  user: string;
  avatar: string;
  content: string;
  postTitle: string;
}

@Injectable({ providedIn: 'root' })
export class BlogMockService {

  // 1. Dữ liệu bài viết chính (Theo JSON của bạn)
  getLatestPosts() {
    return of([
      {
        id: "1",
        title: "7 Proven Strategies to Expand Your English Vocabulary Fast",
        slug: "english-vocab-strategies",
        categoryName: "Education",
        metaData: {
          thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=800&q=80",
          summary: "Discover the most effective methods to boost your vocabulary retention and usage.",
          readingTime: 8,
          stats: { views: 1250, likes: 450 }
        },
        createdAt: "2024-03-10"
      },
      {
        id: "2",
        title: "Top Frontend Trends to Watch in 2024: Angular & AI",
        slug: "frontend-trends",
        categoryName: "Technology",
        metaData: {
          thumbnail: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=format&fit=crop&w=800&q=80",
          summary: "Explore the cutting-edge trends in frontend development, from AI integration to Angular 17.",
          readingTime: 12,
          stats: { views: 3400, likes: 890 }
        },
        createdAt: "2024-03-09"
      },
      {
        id: "3",
        title: "Meal Prep: Hướng dẫn chuẩn bị bữa ăn healthy cho cả tuần",
        slug: "meal-prep-guide",
        categoryName: "Lifestyle",
        metaData: {
          thumbnail: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
          summary: "Tiết kiệm thời gian và tiền bạc với phương pháp Meal Prep khoa học.",
          readingTime: 6,
          stats: { views: 560, likes: 120 }
        },
        createdAt: "2024-03-08"
      }
    ]);
  }

  // 2. Mock Bài viết Nổi bật (Featured - Cái to nhất đầu trang)
  getFeaturedPost() {
    return of({
      title: "Hành trình chinh phục đỉnh Fansipan trong 2 ngày 1 đêm",
      slug: "fansipan-trekking",
      thumbnail: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80",
      category: "Du lịch",
      date: "2024-03-11"
    });
  }

  // 3. Mock Trending (Bài xem nhiều ở Sidebar)
  getTrendingPosts(): WidgetPost[] {
    return [
      { id: 't1', title: 'Làm sao để ngủ ngon hơn?', thumbnail: 'https://images.unsplash.com/photo-1541781777621-af1187546367?w=200', date: 'Oct 12, 2023' },
      { id: 't2', title: 'Review iPhone 15 Pro Max', thumbnail: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200', date: 'Nov 05, 2023' },
      { id: 't3', title: '10 quán cafe đẹp ở Hà Nội', thumbnail: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=200', date: 'Dec 01, 2023' },
      { id: 't4', title: 'Cách học ReactJS trong 1 tuần', thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=200', date: 'Jan 15, 2024' },
    ];
  }

  // 4. Mock Social Stats
  getSocialStats(): SocialStat[] {
    return [
      { platform: 'Facebook', count: '12,403', unit: 'Fans', icon: 'fab fa-facebook-f', color: '#3b5999' },
      { platform: 'Twitter', count: '3,102', unit: 'Followers', icon: 'fab fa-twitter', color: '#55acee' },
      { platform: 'Youtube', count: '25,000', unit: 'Subs', icon: 'fab fa-youtube', color: '#cd201f' }
    ];
  }

  // 5. Mock Tags
  getTags() {
    return ['Software', 'Travel', 'Health', 'Foods', 'Angular', 'Java', 'Design'];
  }
  
  // 6. Mock Categories (Sidebar)
  getCategories() {
      return [
          { name: 'Công nghệ', count: 12 },
          { name: 'Du lịch', count: 8 },
          { name: 'Ẩm thực', count: 15 },
          { name: 'Sức khỏe', count: 6 },
      ]
  }

  // 1. NEW: Mock Latest News (3 tin nổi bật phụ)
  getLatestNews() {
    return of([
      {
        id: 'n1',
        title: "AI thay đổi cách chúng ta học ngoại ngữ như thế nào?",
        thumbnail: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500&q=80",
        category: "Tech",
        date: "2024-03-12"
      },
      {
        id: 'n2',
        title: "5 địa điểm cắm trại 'chill' ngay gần Sài Gòn",
        thumbnail: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=500&q=80",
        category: "Travel",
        date: "2024-03-11"
      },
      {
        id: 'n3',
        title: "Review sách: 'Atomic Habits' - Thay đổi tí hon",
        thumbnail: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80",
        category: "Books",
        date: "2024-03-10"
      }
    ]);
  }

  // 2. NEW: Mock Recommended Comments
  getRecommendedComments(): CommentWidget[] {
    return [
      {
        user: "Minh Tuấn",
        avatar: "https://ui-avatars.com/api/?name=Minh+Tuan&background=random",
        content: "Bài viết rất hữu ích, mình đã áp dụng và thấy hiệu quả ngay!",
        postTitle: "7 Strategies to Expand Vocabulary"
      },
      {
        user: "Sarah Nguyen",
        avatar: "https://ui-avatars.com/api/?name=Sarah+Nguyen&background=random",
        content: "Mình nghĩ phần 2 cần giải thích rõ hơn về Angular Signals.",
        postTitle: "Frontend Trends 2024"
      },
      {
        user: "David Pham",
        avatar: "https://ui-avatars.com/api/?name=David+Pham&background=random",
        content: "Cảm ơn tác giả đã chia sẻ kinh nghiệm quý báu.",
        postTitle: "Meal Prep Guide"
      }
    ];
  }
}