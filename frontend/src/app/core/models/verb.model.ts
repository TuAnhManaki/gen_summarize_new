import { Example } from "./structure.model";

export interface verb {
  id: string;
  v1: string;
  v2: string;
  v3: string;
  meaning: string;
  level: string;
  examples: Example;
  detail: VerbDetail;
}

// 2. Interface cho Bài tập
export interface VerbExercise {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}


// 3. Interface cho object Detail
export interface VerbDetail {
  context: string;
  examples: Example[];
  exercises: VerbExercise[];
}
