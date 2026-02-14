
export type View = 'dashboard' | 'upload' | 'summarize' | 'quiz' | 'ask' | 'planner';

export interface User {
  name: string;
  email: string;
  isLoggedIn: boolean;
}

export interface Flashcard {
  front: string;
  back: string;
}

export interface StudyNote {
  id: string;
  name: string;
  content: string;
  timestamp: string;
  pages: number;
  type: 'pdf' | 'docx' | 'txt';
  summary?: string;
  questions?: QuestionsSet;
  quizzes?: QuizItem[];
  flashcards?: Flashcard[];
}

export interface QuestionsSet {
  marks2: string[];
  marks5: string[];
  marks10: string[];
}

export interface QuizItem {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}

export interface StudyTask {
  day: string;
  topic: string;
  focus: string;
  strategy: string;
  completed?: boolean;
}

export interface StudyPlan {
  examName: string;
  examDate: string;
  plan: StudyTask[];
}
