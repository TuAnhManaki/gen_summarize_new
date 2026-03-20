export interface Comment {
    id: number;
    avatarLetter: string; // Chữ cái trong avatar (VD: B, Đ, T)
    username: string;
    content: string;
    likes: number;
    time: string; // VD: 6h trước
    replyCount: number; // Số lượng trả lời (VD: 5 trả lời)
    isLiked: boolean;
    replies: number;
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
  export interface BlogMetaData {
    thumbnail: string;
    summary: string;
    readingTime: number;
    tags: string[];
    seo: {
      title: string | null;
      keywords: string;
      description: string;
    };
    stats: {
      views: number;
      likes: number;
    };
  }
  
  export interface BlogPost {
    id: string;
    title: string;
    slug: string;
    categoryName: string;
    status: string;
    createdAt: string | null;
    metaData: BlogMetaData;
  }
  
  export interface BlogResponse {
    items: BlogPost[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }
