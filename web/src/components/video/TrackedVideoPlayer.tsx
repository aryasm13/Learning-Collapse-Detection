"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  videoId: string;
  title: string;
};

export function TrackedVideoPlayer({ videoId, title }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [lastTime, setLastTime] = useState(0);
  const [watchTime, setWatchTime] = useState(0);
  const [sending, setSending] = useState(false);

  function getStudentId(): string | null {
    if (typeof window === "undefined") return null;
    return (
      window.localStorage.getItem("id_student") ||
      window.localStorage.getItem("student_id") ||
      null
    );
  }

  function getSessionId(): string {
    const KEY = "clickstream_session_id";
    if (typeof window === "undefined") return "server-session";
    let sid = window.localStorage.getItem(KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      window.localStorage.setItem(KEY, sid);
    }
    return sid;
  }

  const sendEvent = useCallback(
    async (
      eventType: string,
      extra?: { progress?: number; watchTimeDelta?: number }
    ) => {
      try {
        setSending(true);
        await fetch("/api/clickstream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            events: [
              {
                idStudent: getStudentId(),
                eventType: `video_${eventType}`,
                elementId: videoId,
                elementText: title,
                pageURL: typeof window !== "undefined" ? window.location.href : "/",
                sessionId: getSessionId(),
                userAgent:
                  typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
                timestamp: new Date().toISOString(),
                ...extra,
              },
            ],
          }),
        });
      } catch {
        // swallow in demo
      } finally {
        setSending(false);
      }
    },
    [title, videoId]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setLastTime(video.currentTime);
      sendEvent("play", {
        progress: (video.currentTime / video.duration) * 100 || 0,
      });
    };

    const handlePause = () => {
      const delta = Math.max(video.currentTime - lastTime, 0);
      setWatchTime((w) => w + delta);
      setLastTime(video.currentTime);
      sendEvent("pause", {
        progress: (video.currentTime / video.duration) * 100 || 0,
        watchTimeDelta: delta,
      });
    };

    const handleSeeking = () => {
      sendEvent("seek", {
        progress: (video.currentTime / video.duration) * 100 || 0,
      });
      setLastTime(video.currentTime);
    };

    const handleTimeUpdate = () => {
      if (video.paused) return;
      const delta = Math.max(video.currentTime - lastTime, 0);
      if (delta > 0.5) {
        setWatchTime((w) => w + delta);
        setLastTime(video.currentTime);
      }
    };

    const handleEnded = () => {
      const delta = Math.max(video.duration - lastTime, 0);
      setWatchTime((w) => w + delta);
      sendEvent("completed", { progress: 100, watchTimeDelta: delta });
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("seeking", handleSeeking);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("seeking", handleSeeking);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
    };
  }, [lastTime, sendEvent, videoId]);

  const watchMinutes = Math.floor(watchTime / 60);
  const watchSeconds = Math.floor(watchTime % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Tracked video
          </p>
          <p className="text-sm font-semibold text-slate-50">{title}</p>
        </div>
        <span className="rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">
          Watch time: {watchMinutes}:{watchSeconds}
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-black">
        <video
          ref={videoRef}
          controls
          className="w-full bg-black object-cover md:h-[420px]"
        >
          <source src="/sample-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>

      {sending && (
        <p className="text-[11px] text-slate-500">Syncing engagement data…</p>
      )}
    </div>
  );
}

