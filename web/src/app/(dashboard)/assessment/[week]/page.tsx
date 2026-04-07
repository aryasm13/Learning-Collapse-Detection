import { redirect } from "next/navigation";

export default async function LegacyAssessmentRoute() {
  // Legacy route kept for compatibility with older links.
  redirect("/assessments");
}

