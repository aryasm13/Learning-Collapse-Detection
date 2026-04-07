"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

type ClickEvent = {
  idStudent?: string | null;
  eventType: string;
  elementId?: string | null;
  elementText?: string | null;
  pageURL: string;
  sessionId: string;
  userAgent: string;
  timestamp: string;
};

const API_ENDPOINT = "/api/clickstream";
const BATCH_SIZE = 10;
const BATCH_INTERVAL_MS = 5000;

export function ClickstreamTracker() {
  const queueRef = useRef<ClickEvent[]>([]);
  const lastFlushRef = useRef<number>(Date.now());
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathname = usePathname();

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
    if (typeof window === "undefined") return "server-session"; // fallback
    let sid = window.localStorage.getItem(KEY);
    if (!sid) {
      sid = crypto.randomUUID();
      window.localStorage.setItem(KEY, sid);
    }
    return sid;
  }

  function buildEventPayload(
    eventType: string,
    target: HTMLElement | null
  ): ClickEvent {
    const elementId = target?.id || null;
    let elementText: string | null = null;

    if (target) {
      const text =
        ("innerText" in target && (target as HTMLElement).innerText) ||
        (target instanceof HTMLInputElement && target.value) ||
        (target instanceof HTMLTextAreaElement && target.value) ||
        (target instanceof HTMLSelectElement && target.value) ||
        "";
      elementText = text.toString().trim().slice(0, 255) || null;
    }

    return {
      idStudent: getStudentId(),
      eventType,
      elementId,
      elementText,
      pageURL: typeof window !== "undefined" ? window.location.href : pathname,
      sessionId: getSessionId(),
      userAgent:
        typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
      timestamp: new Date().toISOString(),
    };
  }

  function queueEvent(ev: ClickEvent) {
    queueRef.current.push(ev);
    const now = Date.now();

    if (
      queueRef.current.length >= BATCH_SIZE ||
      now - lastFlushRef.current >= BATCH_INTERVAL_MS
    ) {
      void flushEvents();
    } else if (!flushTimerRef.current) {
      flushTimerRef.current = setTimeout(() => {
        void flushEvents();
      }, BATCH_INTERVAL_MS);
    }
  }

  async function flushEvents() {
    if (!queueRef.current.length) return;
    const toSend = queueRef.current;
    queueRef.current = [];
    lastFlushRef.current = Date.now();

    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
      flushTimerRef.current = null;
    }

    const payload = { events: toSend };

    try {
      fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {
        // swallow network errors
      });
    } catch {
      // ignore
    }
  }

  // Attach global listeners once
  useEffect(() => {
    if (typeof document === "undefined") return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target) return;

      const tagName = target.tagName.toLowerCase();
      if (tagName === "button") {
        queueEvent(buildEventPayload("button_click", target));
      } else if (tagName === "a") {
        queueEvent(buildEventPayload("link_click", target));
      }
    };

    const handleSubmit = (event: Event) => {
      const target = event.target as HTMLElement | null;
      if (!target || target.tagName.toLowerCase() !== "form") return;
      queueEvent(buildEventPayload("form_submit", target));
    };

    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);
    window.addEventListener("beforeunload", flushEvents);

    const intervalId = setInterval(() => {
      void flushEvents();
    }, BATCH_INTERVAL_MS);

    return () => {
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
      window.removeEventListener("beforeunload", flushEvents);
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track page views on initial load and navigation
  useEffect(() => {
    if (!pathname) return;
    const event = buildEventPayload("page_view", document.body);
    queueEvent(event);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}

