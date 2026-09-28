import { cn } from "@/lib/utils";

/* GitHub linguist colours for the languages we're likely to see. */
const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#2B7489",
  JavaScript: "#D6B400",
  Python: "#3572A5",
  Rust: "#B7410E",
  Go: "#00ADD8",
  Java: "#B07219",
  Kotlin: "#A97BFF",
  MDX: "#A97BFF",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C#": "#178600",
  "C++": "#F34B7D",
  C: "#555555",
  Swift: "#F05138",
  Dart: "#00B4AB",
  HTML: "#E34C26",
  CSS: "#563D7C",
  Shell: "#89E051",
};

/** Language · Private/Public · branch line under a repository name. */
export function RepoMeta({
  language,
  isPrivate,
  branch,
  className,
}: {
  language: string | null;
  isPrivate: boolean;
  branch?: string | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-fg-subtle",
        className,
      )}
    >
      {language ? (
        <>
          <span className="inline-flex items-center gap-[5px]">
            <span
              aria-hidden="true"
              className="size-2 rounded-full"
              style={{ background: LANGUAGE_COLORS[language] ?? "#9A95A8" }}
            />
            {language}
          </span>
          <span aria-hidden="true">·</span>
        </>
      ) : null}
      <span
        className={cn(
          "rounded-full px-[7px] py-px",
          isPrivate ? "bg-surface-muted text-fg-muted" : "bg-pass-fill text-pass",
        )}
      >
        {isPrivate ? "Private" : "Public"}
      </span>
      {branch ? (
        <>
          <span aria-hidden="true">·</span>
          <span className="font-mono text-[12px]">{branch}</span>
        </>
      ) : null}
    </div>
  );
}
