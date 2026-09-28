import Link from "next/link";

import { cn } from "@/lib/utils";

/** The Mergegate mark: a branch that merges back. Stroke colour follows `className`. */
function LogoMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <path d="M6 9v6" />
      <path d="M18 8v3a4 4 0 0 1-4 4H9" />
      <circle cx="18" cy="5" r="3" />
    </svg>
  );
}

/** Mark + wordmark. `tone="ink"` for dark chrome, `"paper"` for light surfaces. */
function Logo({
  href = "/",
  tone = "ink",
  size = 24,
  className,
}: {
  href?: string;
  tone?: "ink" | "paper";
  size?: number;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2.5 no-underline",
        tone === "ink" ? "text-ink-fg hover:text-ink-fg" : "text-fg hover:text-fg",
        className,
      )}
    >
      <LogoMark
        size={size}
        className={tone === "ink" ? "text-violet-400" : "text-violet-500"}
      />
      <span className="font-display text-[17px] font-extrabold tracking-[-0.02em]">
        Mergegate
      </span>
    </Link>
  );
}

function GithubMark({ size = 18, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d="M12 2C6.5 2 2 6.6 2 12.3c0 4.5 2.9 8.4 6.8 9.7.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 3 .9.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.2-4.6-5.2 0-1.1.4-2 1-2.8-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.7 1a9 9 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.4.2 2.4.1 2.7.6.8 1 1.7 1 2.8 0 4-2.4 4.9-4.6 5.2.4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10.2 10.2 0 0 0 22 12.3C22 6.6 17.5 2 12 2z" />
    </svg>
  );
}

export { GithubMark, Logo, LogoMark };
