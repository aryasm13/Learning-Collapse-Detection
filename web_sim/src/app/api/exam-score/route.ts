import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/ensureDemoEntities";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      userId = "demo-user",
      examType,
      score,
    } = body as { userId?: string; examType: string; score: number };

    if (!examType || score == null) {
      return NextResponse.json(
        { error: "examType and score are required" },
        { status: 400 }
      );
    }

    await ensureDemoUser(userId);

    await prisma.examScore.create({
      data: {
        userId,
        examType,
        score,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error saving exam score", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

