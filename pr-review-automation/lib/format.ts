const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** "12 min ago", "4 hr ago", "yesterday", "3 days ago", then a date. */
export function timeAgo(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  const diff = Date.now() - date.getTime();
  if (Number.isNaN(diff)) return "—";
  if (diff < MINUTE) return "just now";
  if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / HOUR)} hr ago`;
  if (diff < 2 * DAY) return "yesterday";
  if (diff < 30 * DAY) return `${Math.floor(diff / DAY)} days ago`;
  return formatDate(date);
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function initials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.replace(/[^a-zA-Z0-9]+/g, " ").trim().split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}
