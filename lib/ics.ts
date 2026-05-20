import type { ServiceEvent } from "./supabase";

function formatICSDate(iso: string): string {
  return new Date(iso)
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

// RFC 5545 caps content lines at 75 octets; longer lines fold onto a
// continuation line that starts with a single space.
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [line.slice(0, 75)];
  let rest = line.slice(75);
  while (rest.length > 0) {
    parts.push(" " + rest.slice(0, 74));
    rest = rest.slice(74);
  }
  return parts.join("\r\n");
}

export function buildICS(event: ServiceEvent): string {
  const start = formatICSDate(event.starts_at);
  const end = formatICSDate(
    event.ends_at ??
      new Date(new Date(event.starts_at).getTime() + 60 * 60 * 1000).toISOString()
  );
  const stamp = formatICSDate(new Date().toISOString());

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Stake Service//Service Projects//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@stake-service`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeICS(event.title)}`,
  ];
  if (event.description) lines.push(`DESCRIPTION:${escapeICS(event.description)}`);
  if (event.location) lines.push(`LOCATION:${escapeICS(event.location)}`);
  lines.push("END:VEVENT", "END:VCALENDAR");

  return lines.map(foldLine).join("\r\n");
}
