import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/ensureDemoEntities";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user",
      week,
      content,
    } = body as { userId?: string; week: number; content: string };

    if (!week || !content) {
      return NextResponse.json(
        { error: "week and content are required" },
        { status: 400 }
      );
    }

    const mockScore = 60 + Math.floor(Math.random() * 41); // 60-100

    await ensureDemoUser(userId);

    await prisma.weeklyAssessment.create({
      data: {
        userId,
        week,
        content,
        score: mockScore,
      },
    });

    return NextResponse.json({ ok: true, score: mockScore });
  } catch (error) {
    console.error("Error saving weekly assessment", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

