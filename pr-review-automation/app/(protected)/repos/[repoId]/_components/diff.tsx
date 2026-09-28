import { cn } from "@/lib/utils";

type DiffLine =
  | { kind: "hunk"; text: string }
  | { kind: "add" | "del" | "ctx"; text: string; oldNo: number | null; newNo: number | null }
  | { kind: "meta"; text: string };

/** Parses a GitHub unified `patch` into rows with old/new line numbers. */
export function parsePatch(patch: string): DiffLine[] {
  const rows: DiffLine[] = [];
  let oldNo = 0;
  let newNo = 0;

  for (const raw of patch.split("\n")) {
    if (raw.startsWith("@@")) {
      const match = /@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/.exec(raw);
      if (match) {
        oldNo = Number(match[1]);
        newNo = Number(match[2]);
      }
      rows.push({ kind: "hunk", text: raw });
    } else if (raw.startsWith("+")) {
      rows.push({ kind: "add", text: raw.slice(1), oldNo: null, newNo: newNo++ });
    } else if (raw.startsWith("-")) {
      rows.push({ kind: "del", text: raw.slice(1), oldNo: oldNo++, newNo: null });
    } else if (raw.startsWith("\\")) {
      rows.push({ kind: "meta", text: raw });
    } else {
      rows.push({ kind: "ctx", text: raw.slice(1), oldNo: oldNo++, newNo: newNo++ });
    }
  }
  return rows;
}

const ROW = {
  add: "bg-diff-add text-diff-add-fg",
  del: "bg-diff-del text-diff-del-fg",
  ctx: "text-fg-2",
} as const;

const NUM = {
  add: "text-[#6FA48A]",
  del: "text-[#C08A96]",
  ctx: "text-[#A9A5B4]",
} as const;

/** Unified diff: two line-number gutters, then the code. Scrolls horizontally. */
export function DiffView({ patch }: { patch?: string }) {
  if (!patch) {
    return (
      <p className="px-4 py-5 text-[13.5px] text-fg-subtle">
        GitHub did not return a diff for this file — it may be binary, renamed without changes,
        or too large to display.
      </p>
    );
  }

  const rows = parsePatch(patch);

  return (
    <div className="overflow-x-auto font-mono text-[13px] leading-[25px]">
      <div className="min-w-max">
        {rows.map((row, index) => {
          if (row.kind === "hunk" || row.kind === "meta") {
            return (
              <div key={index} className="flex bg-surface-sunken text-fg-subtle">
                <span className="w-24 shrink-0" />
                <span className="pr-4 pl-3.5 text-[12.5px] whitespace-pre">{row.text}</span>
              </div>
            );
          }
          const sign = row.kind === "add" ? "+" : row.kind === "del" ? "−" : " ";
          return (
            <div key={index} className={cn("flex", ROW[row.kind])}>
              <span
                className={cn("w-12 shrink-0 pr-3 text-right select-none", NUM[row.kind])}
              >
                {row.oldNo ?? ""}
              </span>
              <span
                className={cn("w-12 shrink-0 pr-3 text-right select-none", NUM[row.kind])}
              >
                {row.newNo ?? ""}
              </span>
              <span className="pr-4 pl-3.5 whitespace-pre">
                <span className="select-none">{sign} </span>
                {row.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
