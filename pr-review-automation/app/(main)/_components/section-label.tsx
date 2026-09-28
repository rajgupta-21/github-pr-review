import { cn } from "@/lib/utils";

/** Mono uppercase eyebrow used above every marketing section heading. */
export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "font-mono text-[12.5px] tracking-[0.14em] text-[#7E58F0] uppercase",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SectionTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h2
      className={cn(
        "mt-3 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.03em] text-ink-fg-strong sm:text-[42px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

export function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

export function ArrowRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path d="M5 12h13" />
      <path d="M13 6l6 6-6 6" />
    </svg>
  );
}
