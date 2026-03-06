import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/ensureDemoEntities";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user",
      week,
      score,
      timeTaken,
    } = body as {
      userId?: string;
      week: number;
      score: number;
      timeTaken: number;
    };

    if (week == null || score == null || timeTaken == null) {
      return NextResponse.json(
        { error: "week, score and timeTaken are required" },
        { status: 400 }
      );
    }

    await ensureDemoUser(userId);

    await prisma.quizAttempt.create({
      data: {
        userId,
        week,
        score,
        timeTaken,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving quiz attempt", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

