import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      status: "deprecated",
      message:
        "This endpoint belonged to the demo flow. Exam behavior is now tracked via exam_sessions and behavior_metrics.",
    },
    { status: 410 }
  );
}

