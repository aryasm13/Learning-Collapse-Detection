import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureDemoUser, ensureDemoVideo } from "@/lib/ensureDemoEntities";

type GenericClickEventPayload = {
  eventType: string;
  elementId?: string | null;
  elementText?: string | null;
  pageURL: string;
  sessionId: string;
  userAgent: string;
  timestamp: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Generic UI clickstream (batched)
    if (Array.isArray((body as any).events)) {
      const events = (body as { events: GenericClickEventPayload[] }).events;

      if (!events.length) {
        return NextResponse.json(
          { status: "error", message: "No events provided" },
          { status: 400 }
        );
      }

      const docs = events.map((ev) => {
        const {
          eventType,
          elementId = null,
          elementText = null,
          pageURL,
          sessionId,
          userAgent,
          timestamp,
        } = ev;

        if (
          !eventType ||
          !pageURL ||
          !sessionId ||
          !userAgent ||
          !timestamp
        ) {
          throw new Error("Missing required click event fields");
        }

        return {
          eventType,
          elementId,
          elementText,
          pageURL,
          sessionId,
          userAgent,
          timestamp: new Date(timestamp),
        };
      });

      await prisma.clickEvent.createMany({ data: docs });

      return NextResponse.json({ status: "ok" });
    }

    // Existing video engagement clickstream (single event)
    const {
      userId = "demo-user",
      videoId = "demo-video",
      eventType,
      progress,
      watchTimeDelta,
    } = body as {
      userId?: string;
      videoId?: string;
      eventType: string;
      progress?: number;
      watchTimeDelta?: number;
    };

    if (!eventType) {
      return NextResponse.json(
        { error: "eventType is required" },
        { status: 400 }
      );
    }

    await Promise.all([ensureDemoUser(userId), ensureDemoVideo(videoId)]);

    await prisma.clickstreamEvent.create({
      data: {
        userId,
        videoId,
        eventType,
        progress: typeof progress === "number" ? progress : null,
      },
    });

    if (typeof progress === "number" || typeof watchTimeDelta === "number") {
      await prisma.videoProgress.upsert({
        where: { userId_videoId: { userId, videoId } },
        update: {
          progress: typeof progress === "number" ? progress : undefined,
          watchTime:
            typeof watchTimeDelta === "number"
              ? { increment: Math.max(watchTimeDelta, 0) }
              : undefined,
        },
        create: {
          userId,
          videoId,
          progress: typeof progress === "number" ? progress : 0,
          watchTime: Math.max(watchTimeDelta ?? 0, 0),
        },
      });
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Error logging clickstream event", error);
    return NextResponse.json(
      { status: "error", message: "Internal Server Error" },
      { status: 500 }
    );
  }
}

