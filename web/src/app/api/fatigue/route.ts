import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser } from "@/lib/ensureDemoEntities";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      studentId,
      presenceDuration,
      postureScore,
      lightLevel,
      fatigueIndex,
      userId = "demo-user",
    } = body as {
      studentId: string;
      presenceDuration: number;
      postureScore: number;
      lightLevel: number;
      fatigueIndex: number;
      userId?: string;
    };

    if (!studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }

    await ensureDemoUser(userId);

    await prisma.fatigueLog.create({
      data: {
        userId,
        studentId,
        presenceDuration,
        postureScore,
        lightLevel,
        fatigueIndex,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error logging fatigue data", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

