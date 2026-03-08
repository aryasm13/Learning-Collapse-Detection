import { prisma } from "@/lib/prisma";

/**
 * The demo UI/API calls use `userId = "demo-user"` (and sometimes `videoId`).
 * Those models have foreign keys, so we need to ensure the referenced rows exist.
 */
export async function ensureDemoUser(userId: string) {
  await prisma.user.upsert({
    where: { id: userId },
    update: {},
    create: {
      id: userId,
      email: `${userId}@example.com`,
    },
  });
}

export async function ensureDemoVideo(videoId: string) {
  await prisma.video.upsert({
    where: { id: videoId },
    update: {},
    create: {
      id: videoId,
      title: `Demo video (${videoId})`,
      description: "Auto-created demo video for engagement tracking.",
    },
  });
}

