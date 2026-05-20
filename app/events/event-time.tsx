"use client";

import { useEffect, useState } from "react";

// Renders the event time in the visitor's own timezone. Formatting happens
// after mount so server and client (different timezones) never disagree.
export function EventTime({ start, end }: { start: string; end: string | null }) {
  const [text, setText] = useState("");

  useEffect(() => {
    const s = new Date(start);
    const date = s.toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const startTime = s.toLocaleTimeString(undefined, {
      hour: "numeric",
      minute: "2-digit",
    });
    let value = `${date} · ${startTime}`;
    if (end) {
      const endTime = new Date(end).toLocaleTimeString(undefined, {
        hour: "numeric",
        minute: "2-digit",
      });
      value += ` – ${endTime}`;
    }
    setText(value);
  }, [start, end]);

  return <span suppressHydrationWarning>{text || "…"}</span>;
}
