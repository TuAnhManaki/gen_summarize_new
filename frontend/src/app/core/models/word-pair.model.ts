import { Example } from "./structure.model";

export interface WordPair {
    id: number;
    adjective: string;
    adverb: string;
    adjectiveMeaning: string;
    adverbMeaning: string;
    shortExample: Example;
    adjectiveExamples: Example[]; 
    adverbExamples: Example[];
    note?: string; // Dấu ? vì có thể có từ không có ghi chú
  }