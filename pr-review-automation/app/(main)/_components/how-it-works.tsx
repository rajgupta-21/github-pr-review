import { cn } from "@/lib/utils";

import { SectionLabel, SectionTitle } from "./section-label";

const STEPS = [
  {
    n: "01",
    title: "Connect repositories",
    body: "Sign in with GitHub and connect the repos you want covered. The webhook is installed when you save a workflow.",
    icon: <path d="M4 7a3 3 0 0 1 3-3h4l2 2h4a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3z" />,
  },
  {
    n: "02",
    title: "Shape the workflow",
    body: "Drag nodes onto the canvas: trigger, review passes, then the actions to take — comment, approve, notify.",
    icon: (
      <>
        <circle cx="6" cy="6" r="2.5" />
        <circle cx="6" cy="18" r="2.5" />
        <circle cx="18" cy="12" r="2.5" />
        <path d="M6 8.5v7" />
        <path d="M8.5 6h4a3 3 0 0 1 3 3v1" />
      </>
    ),
  },
  {
    n: "03",
    title: "Open a PR",
    body: "The review lands on the thread before your teammate has finished their coffee, scored and cited by file.",
    icon: <path d="M13 3L5 14h6l-1 7 8-11h-6z" />,
    highlight: true,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-[76px] border-b border-ink-line bg-ink-950 px-4 py-16 sm:px-8 lg:px-16 lg:py-[76px]">
      <div className="mx-auto max-w-[1312px]">
        <div className="mb-11 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <SectionLabel>How it works</SectionLabel>
            <SectionTitle>Three steps, then it runs itself</SectionTitle>
          </div>
          <p className="max-w-[360px] text-[15px] leading-[1.6] text-ink-subtle">
            No CI config, no YAML. Mergegate installs a webhook on the repositories you pick and
            takes it from there.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className={cn(
                "rounded-xl border p-7",
                step.highlight ? "border-ink-600 bg-[#18142E]" : "border-[#262340] bg-[#131223]",
              )}
            >
              <div className="flex items-center gap-3">
                <span className={cn("font-mono text-[13px]", step.highlight ? "text-violet-300" : "text-[#7E58F0]")}>
                  {step.n}
                </span>
                <span aria-hidden="true" className={cn("h-px flex-1", step.highlight ? "bg-ink-600" : "bg-[#262340]")} />
              </div>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.7}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className={cn("mt-[22px] size-[26px]", step.highlight ? "text-[#C4B6FF]" : "text-violet-300")}
              >
                {step.icon}
              </svg>
              <h3 className="mt-4 font-display text-[21px] font-bold text-ink-fg-strong">{step.title}</h3>
              <p className={cn("mt-[9px] text-[14.5px] leading-[1.6]", step.highlight ? "text-[#C0B8E0]" : "text-[#9C96BE]")}>
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
