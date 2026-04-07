import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import type { Assessment, Course, Module } from "./types";

export type CourseWithModules = Course & {
  modules: Array<
    Module & {
      assessments: Assessment[];
    }
  >;
};

export async function fetchCourses(): Promise<CourseWithModules[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("courses")
    .select(
      "id,title,description,modules(id,course_id,title,week,order,assessments(id,module_id,type,title,time_limit_seconds,max_questions))"
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch courses", error);
    return [];
  }

  type RowAssessment = {
    id: string;
    module_id: string;
    type: "quiz" | "exam";
    title: string;
    time_limit_seconds: number;
    max_questions: number;
  };
  type RowModule = {
    id: string;
    course_id: string;
    title: string;
    week: number;
    order: number;
    assessments: RowAssessment[] | null;
  };
  type RowCourse = {
    id: string;
    title: string;
    description: string | null;
    modules: RowModule[] | null;
  };

  const rows = (data ?? []) as unknown as RowCourse[];
  return rows.map((c) => ({
    id: c.id,
    title: c.title,
    description: c.description ?? null,
    modules: (c.modules ?? [])
      .slice()
      .sort((a, b) => (a.week - b.week) || (a.order - b.order))
      .map((m) => ({
        id: m.id,
        course_id: m.course_id,
        title: m.title,
        week: m.week,
        order: m.order,
        assessments: (m.assessments ?? []).map((a) => ({
          id: a.id,
          module_id: a.module_id,
          type: a.type,
          title: a.title,
          time_limit_seconds: a.time_limit_seconds,
          max_questions: a.max_questions,
        })),
      })),
  }));
}

