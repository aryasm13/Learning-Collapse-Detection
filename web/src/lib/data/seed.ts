import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { seedCourses } from "@/config/seedData";

export async function ensureSeedData() {
  const admin = getSupabaseAdmin();

  const { count, error: countError } = await admin
    .from("courses")
    .select("id", { count: "exact", head: true });

  if (countError) {
    console.error("Seed check failed", countError);
    return;
  }

  if ((count ?? 0) > 0) return;

  for (const course of seedCourses) {
    const { data: insertedCourse, error: courseError } = await admin
      .from("courses")
      .insert({ title: course.title, description: course.description })
      .select("id")
      .single();

    if (courseError || !insertedCourse?.id) {
      console.error("Course seed failed", courseError);
      continue;
    }

    for (const mod of course.modules) {
      const { data: insertedModule, error: moduleError } = await admin
        .from("modules")
        .insert({
          course_id: insertedCourse.id,
          title: mod.title,
          week: mod.week,
          order: mod.order,
        })
        .select("id")
        .single();

      if (moduleError || !insertedModule?.id) {
        console.error("Module seed failed", moduleError);
        continue;
      }

      for (const asmt of mod.assessments) {
        const { data: insertedAssessment, error: asmtError } = await admin
          .from("assessments")
          .insert({
            module_id: insertedModule.id,
            type: asmt.type,
            title: asmt.title,
            time_limit_seconds: asmt.time_limit_seconds,
            max_questions: asmt.max_questions,
          })
          .select("id")
          .single();

        if (asmtError || !insertedAssessment?.id) {
          console.error("Assessment seed failed", asmtError);
          continue;
        }

        const questionRows = asmt.questions.map((q) => ({
          assessment_id: insertedAssessment.id,
          question: q.question,
          options: q.options,
          correct_answer: q.correct_answer,
        }));

        const { error: qError } = await admin.from("questions").insert(questionRows);
        if (qError) {
          console.error("Question seed failed", qError);
        }
      }
    }
  }
}

