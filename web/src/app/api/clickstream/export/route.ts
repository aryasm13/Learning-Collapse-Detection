import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET() {
  const { data, error } = await getSupabaseAdmin()
    .from("clickstream_data")
    .select("id_student,id_site,date,sum_click")
    .order("id_student", { ascending: true })
    .order("date", { ascending: true })
    .order("id_site", { ascending: true });

  if (error) {
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }

  const rows = data ?? [];
  let csv = "id_student,id_site,date,sum_click\n";
  for (const r of rows) {
    csv += `${r.id_student},${r.id_site},${r.date},${r.sum_click}\n`;
  }

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename=clickstream_data.csv`,
      "Cache-Control": "no-store",
    },
  });
}
