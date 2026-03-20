import { PageResponse } from "@app/core/models/pagination.model";

export interface HomePostDTO {
    id: string; // UUID trong Java map thành string trong TS
    title: string;
    slug: string;
    categoryName: string;
    date: string;    // "Dec 10, 2016"
    image: string;   // Từ metaData.thumbnail
    excerpt: string; // Từ metaData.summary
    views: number;
  }

  export interface SidebarDTO {
    hotNews: HomePostDTO[];
    trendingTags: string[];
  }
  
  export interface HomePostResponseDTO {
    trendingTopics: string[];
    featuredPosts: HomePostDTO[];
    weeklyTop: HomePostDTO[];
    latestNews: PageResponse<HomePostDTO>; // Chuyển từ Page sang PageResponse
    sidebar: SidebarDTO;
  }
  
  // DTO trả về từ Backend cho 1 bài viết
export interface BackendPost {
  id: string;
  title: string;
  slug: string;
  categoryName: string;
  status: string;
  createdAt: string;
  metaData: {
    thumbnail: string;
    summary: string;
    readingTime: number;
    tags: string[];
    stats: {
      views: number;
      likes: number;
    };
  };
}

// DTO tổng hợp cho trang Home (Aggregated Response)
export interface HomeResponse {
  trendingTopics: string[];
  featuredPosts: BackendPost[];
  weeklyTop: BackendPost[];
  latestNews: {
    items: BackendPost[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
  sidebar: {
    hotNews: BackendPost[];
    trendingTags: string[];
  };
}