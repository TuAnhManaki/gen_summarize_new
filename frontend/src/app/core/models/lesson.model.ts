// lesson.model.ts
export interface Lesson {
  id: number;
  code: string;
  title: string;
  image: string;
  subTitle: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'; // Dùng Union type cho xịn
  orderIndex: number;
  active: boolean;
  topic: string;
  duration: string;
  learningSections: string[]; // ['LISTENING', 'SPEAKING', ...]
  content: any;
  status?: 'NOT_STARTED' | 'IN_PROGESS' | 'COMPLETED'; // Thêm trường này vào
}

export interface LessonResponse {
  id: number;
  items: Lesson[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}