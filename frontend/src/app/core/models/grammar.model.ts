// 1. Chi tiết của từng ví dụ
export interface GrammarExample {
  en: string;
  vi: string;
}

// 2. Chi tiết của object Overview
export interface GrammarOverview {
  whenToUse: string[];
  structures: {
    affirmative: string;
    negative: string;
    question: string;
  };
  examples: GrammarExample[];
  exercises: Exercise[]; 
}

// 3. Item trả về từ API
export interface GrammarItem {
  id: number;
  badge?: string;
  desUse?: string;
  note?: string;
  code: string;
  title: string;
  level: string;
  description: string;
  overview: GrammarOverview; // Nhúng interface Overview vào đây
}

// 4. Item hiển thị ra giao diện (Target)
export interface GrammarCard {
  badge: string;
  title: string;
  description: string;
  affirmative: string;
  example: GrammarExample[];
  meaning: string;
  slug: string;
  whenToUse: string[];
}

export interface Exercise {
  type: 'FILL_BLANK' | 'MULTIPLE_CHOICE';
  question: string;
  options?: string[] | null; 
  answer: string;            
  userAnswer?: string;      
  explains?: string;
  status?: 'correct' | 'wrong' | null;
}

export interface TenseLesson {
  slug: string;
  name: string;
}

export const TENSES_LIST: TenseLesson[] = [
  { slug: 'hien-tai-don', name: 'Hiện tại đơn' },
  { slug: 'hien-tai-tiep-dien', name: 'Hiện tại tiếp diễn' },
  { slug: 'hien-tai-hoan-thanh', name: 'Hiện tại hoàn thành' },
  { slug: 'hien-tai-hoan-thanh-tiep-dien', name: 'Hiện tại hoàn thành tiếp diễn' },
  { slug: 'qua-khu-don', name: 'Quá khứ đơn' },
  { slug: 'qua-khu-tiep-dien', name: 'Quá khứ tiếp diễn' },
  { slug: 'qua-khu-hoan-thanh', name: 'Quá khứ hoàn thành' },
  { slug: 'qua-khu-hoan-thanh-tiep-dien', name: 'Quá khứ hoàn thành tiếp diễn' },
  { slug: 'tuong-lai-don', name: 'Tương lai đơn' },
  { slug: 'tuong-lai-tiep-dien', name: 'Tương lai tiếp diễn' },
  { slug: 'tuong-lai-hoan-thanh', name: 'Tương lai hoàn thành' },
  { slug: 'tuong-lai-hoan-thanh-tiep-dien', name: 'Tương lai hoàn thành tiếp diễn' }
];