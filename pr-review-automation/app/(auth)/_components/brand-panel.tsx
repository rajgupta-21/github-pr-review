import { Logo } from "@/components/ui/brand";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    title: "Authorise with GitHub",
    body: "Read access to the repositories you choose, and permission to comment. Nothing else.",
  },
  {
    title: "Pick your repositories",
    body: "Connect the repos you want covered. The webhook is installed when you save a workflow.",
  },
  {
    title: "Open a pull request",
    body: "Your workflow runs on the next PR. Tune it any time on the canvas.",
  },
];

/* Left ink panel on the sign-in and register screens (hidden on small screens). */
export function BrandPanel() {
  return (
    <div className="ink-grid hidden w-[512px] shrink-0 flex-col bg-ink-900 px-11 py-12 lg:flex">
      <Logo href="/" className="[&>span]:text-lg" />

      <div className="flex flex-1 flex-col justify-center">
        <h2 className="font-display text-[38px] leading-[1.1] font-extrabold tracking-[-0.03em] text-ink-fg-strong">
          Three steps and the next PR reviews itself.
        </h2>

        <ol className="mt-[34px] flex flex-col gap-[22px]">
          {STEPS.map((step, index) => (
            <li key={step.title} className="flex gap-[15px]">
              <span
                className={cn(
                  "inline-flex size-[30px] shrink-0 items-center justify-center rounded-full font-mono text-[13px]",
                  index === 0 ? "bg-violet-500 text-white" : "bg-ink-750 text-violet-300",
                )}
              >
                {index + 1}
              </span>
              <div>
                <div className="text-[15.5px] font-semibold text-ink-fg-strong">{step.title}</div>
                <div className="mt-1 text-sm leading-[1.55] text-[#9C96BE]">{step.body}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <p className="text-[13px] leading-[1.6] text-ink-subtle">
        Mergegate reads your diffs to produce a review and does not retain source code after a run.
      </p>
    </div>
  );
}
