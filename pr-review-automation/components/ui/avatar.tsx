import { initials } from "@/lib/format";
import { cn } from "@/lib/utils";

const TONES = {
  /* on ink chrome */
  ink: "bg-ink-600 text-[#D8CEFF]",
  /* on paper */
  violet: "bg-violet-100 text-violet-600",
  neutral: "bg-surface-hover text-fg-muted",
} as const;

/** Initials avatar; shows the GitHub image instead when `src` is given. */
function Avatar({
  name,
  src,
  size = 34,
  tone = "violet",
  className,
}: {
  name?: string | null;
  src?: string | null;
  size?: number;
  tone?: keyof typeof TONES;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.max(9, Math.round(size * 0.38)) };

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        style={style}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={style}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        TONES[tone],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export { Avatar };
