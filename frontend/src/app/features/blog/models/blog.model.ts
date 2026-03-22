// 1. DTO Cơ bản cho Bài viết
export interface ArticleDTO {
  id: string;
  title: string;
  excerpt: string;
  thumbnailUrl: string;
  source: SourceDTO;
  publishedAt: string; // Trong TS/JSON, LocalDateTime thường được trả về dạng chuỗi ISO-8601
  url: string;
  nameSlug: string;
}

export interface SourceDTO {
  name: string;
  slug: string;
  colorClass: string; // VD: "text-red-600"
}

// 2. DTO cho Hero Section (1 tin chính, 4 tin phụ)
export interface HeroSectionDTO {
  mainArticle: ArticleDTO;
  subArticles: ArticleDTO[]; // Tương đương List<ArticleDTO>
}

// 3. DTO cho Category Box
export interface CategoryBoxDTO {
  categoryName: string;
  colorClass: string; // VD: "text-blue-700"
  featuredArticle: ArticleDTO; // Tin có ảnh to
  listArticles: ArticleDTO[]; // 2 tin gạch đầu dòng
  Slug: string; // Slug dùng cho URL khi người dùng click "Xem tất cả"
}

// 4. DTO Tổng hợp cho API Trang Chủ
export interface HomeOverviewResponse {
  trendingTags: string[];
  heroSection: HeroSectionDTO;
  categoryBoxes: CategoryBoxDTO[];
}

export interface Source {
  name: string;        // VD: "VnExpress"
  slug: string;        // VD: "vnexpress"
  colorClass: string;  // VD: "text-red-600"
  bgClass?: string;     // VD: "bg-red-100" (tùy chọn, nếu bạn muốn có nền màu nhạt đi theo màu chữ)
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;     // Tóm tắt do AI sinh ra (có thể rỗng với các tin list phụ)
  thumbnailUrl: string;
  source: Source;
  publishedAt: string; // Định dạng ISO 8601 (VD: "2024-03-20T10:30:00Z")
  url: string;         // Link gốc để mở ra đọc chi tiết
  nameSlug: string;    // Slug dùng cho URL chi tiết bài viết (VD: "vi-mach-ban-dan-2024")
  views: number;
}


export interface PageData<T> {
  number: number;
  totalElements: number;
  content: T[];
  totalPages: number;
  pageNumber: number;
  last: boolean;
  first: boolean;
}


export interface BlogPostListDTO {
  id: string; // UUID
  title: string;
  slug: string;
  createdAt: string;
  categoryName: string;
  status: string;
  author: string;
  metaData: {
    thumbnail: string;
    summary: string;
    views: number;
    tags: string[];
    readingTime: number;
    seo: {
      keywords: string;
      description: string;
    }
  };
}

// --- ĐỊNH NGHĨA INTERFACE CHO CATEGORY DỰA TRÊN JSON CỦA BẠN ---
export interface SourceFilter {
  id: string;
  name: string;
  checked: boolean;
  colorClass: string;
}

export interface CategoryOverviewResponse {
  categoryName: string;
  categoryDescription: string | null;
  heroMainArticle: Article;
  heroSubArticlesCol1: Article[];
  heroSubArticlesCol2: Article[];
  popularArticles: Article[];
  sourcesFilter: SourceFilter[];
}