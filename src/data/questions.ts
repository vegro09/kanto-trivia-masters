export type Difficulty = "سهل" | "متوسط" | "صعب";

export type CategoryId =
  | "general"
  | "geography"
  | "islamic"
  | "منوعات وثقافة عامة"
  | "جغرافيا وعواصم"
  | "إسلاميات وتاريخ إسلامي";

export interface Category {
  id: string;
  name: string;
  description: string;
  cost: number;
}

export interface Question {
  id: string;
  category: string;
  difficulty: Difficulty;
  points: number;
  question: string;
  answer: string;
}

export const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  سهل: 1,
  متوسط: 1,
  صعب: 1,
};

export const DIFFICULTIES: Difficulty[] = ["سهل", "متوسط", "صعب"];

export const CATEGORIES: Category[] = [
  {
    id: "general",
    name: "منوعات وثقافة عامة",
    description: "300 سؤال في العلوم والآداب والاختراعات والألغاز (100 سهل، 100 متوسط، 100 صعب)",
    cost: 0,
  },
  {
    id: "geography",
    name: "جغرافيا وعواصم",
    description: "300 سؤال في دول العالم وعواصمها ومعالمها (100 سهل، 100 متوسط، 100 صعب)",
    cost: 15,
  },
  {
    id: "islamic",
    name: "إسلاميات وتاريخ إسلامي",
    description: "200 سؤال في القرآن والسيرة والتاريخ الإسلامي (100 سهل، 100 متوسط)",
    cost: 15,
  },
];

import questionsJson from "./questions.json";

export const QUESTIONS: Question[] = questionsJson as Question[];
