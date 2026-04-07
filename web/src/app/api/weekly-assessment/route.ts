import { NextResponse } from "next/server";

export async function POST(request: Request) {
  void request;
  return NextResponse.json(
    {
      status: "deprecated",
      message:
        "This endpoint belonged to the demo flow. Weekly reflections are now persisted via server actions.",
    },
    { status: 410 }
  );
}

