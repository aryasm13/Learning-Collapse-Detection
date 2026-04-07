import { redirect } from "next/navigation";

export default async function LegacyQuizRoute({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Backward-compatible route for old quiz links.
  redirect(`/assessments/${id}`);
}

