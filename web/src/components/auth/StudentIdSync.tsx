"use client";

import { useEffect } from "react";

export function StudentIdSync({ studentId }: { studentId: string }) {
  useEffect(() => {
    try {
      window.localStorage.setItem("id_student", studentId);
      window.localStorage.setItem("student_id", studentId);
    } catch {
      // ignore
    }
  }, [studentId]);

  return null;
}

