import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      status: "deprecated",
      message:
        "This endpoint belonged to the demo flow. Fatigue signals should be derived from clickstream rhythm and exam sessions.",
    },
    { status: 410 }
  );
}

