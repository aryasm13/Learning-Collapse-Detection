import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      status: "deprecated",
      message:
        "This endpoint belonged to the demo flow. Attempts are now created/scored server-side via /assessments/[id].",
    },
    { status: 410 }
  );
}

