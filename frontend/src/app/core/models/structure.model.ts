export interface StructureItem {
    id: number;
    code: string;
    title: string;
    subTitle: string;
    description: string;
    formula: string;
    examples: string[];
    sections: GrammarSection[];
    note: string;
  }

export interface Example {
  enHtml: string; // Dùng HTML để có thể bôi đậm (<strong>)
  vi: string;
  en: string;
}

export interface GrammarSection {
  type: 'formula' | 'note'; // Phân loại section: Công thức hoặc Lưu ý
  title: string;
  icon?: string;       // Class icon FontAwesome
  iconColor?: string;  // Màu của icon/tiêu đề
  formula?: string;    // Cấu trúc ngữ pháp
  examples?: Example[]; // Danh sách ví dụ
  noteItems?: string[]; // Danh sách các dòng lưu ý (cho phần Note)
}