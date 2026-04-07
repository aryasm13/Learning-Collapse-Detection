export type Student = {
  id: string;
  name: string;
  email: string | null;
};

export type Course = {
  id: string;
  title: string;
  description: string | null;
};

export type Module = {
  id: string;
  course_id: string;
  title: string;
  week: number;
  order: number;
};

export type AssessmentType = "quiz" | "exam";

export type Assessment = {
  id: string;
  module_id: string;
  type: AssessmentType;
  title: string;
  time_limit_seconds: number;
  max_questions: number;
};

export type Question = {
  id: string;
  assessment_id: string;
  question: string;
  options: string[];
  correct_answer: string;
};

export type Attempt = {
  id: string;
  student_id: string;
  assessment_id: string;
  started_at: string;
  expires_at: string;
  submitted_at: string | null;
  duration_seconds: number | null;
  question_ids: string[];
  answers: Record<string, string>;
  score: number | null;
  is_final: boolean;
  created_at: string;
};

export type ExamSession = {
  id: string;
  student_id: string;
  started_at: string;
  ended_at: string | null;
  time_spent_seconds: number;
  tab_switches: number;
  focus_losses: number;
  click_count: number;
  behavior_state: Record<string, unknown>;
  created_at: string;
};

