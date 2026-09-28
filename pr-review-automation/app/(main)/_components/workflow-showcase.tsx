import Link from "next/link";

import { cn } from "@/lib/utils";

import { ArrowRight, CheckIcon, SectionLabel } from "./section-label";

const POINTS = [
  "Triggers for PR opened, PR updated, manual and scheduled runs",
  "Watch each node's status update after a run",
  "One workflow per repository, saved with its webhook",
];

type DiagramNode = {
  kind: string;
  label: string;
  left: number;
  top: number;
  width: number;
  tone: "trigger" | "review" | "active" | "action";
};

const NODES: DiagramNode[] = [
  { kind: "Trigger", label: "PR opened", left: 40, top: 92, width: 172, tone: "trigger" },
  { kind: "Review", label: "Security scan", left: 312, top: 80, width: 200, tone: "review" },
  { kind: "Review · running", label: "AI code review", left: 312, top: 174, width: 200, tone: "active" },
  { kind: "Review", label: "Performance pass", left: 312, top: 268, width: 200, tone: "review" },
  { kind: "Action", label: "Comment on PR", left: 612, top: 174, width: 172, tone: "action" },
];

const NODE_STYLES = {
  trigger: { box: "border-ink-600 bg-[#1C1836]", kind: "text-[#8A7BD8]" },
  review: { box: "border-[#262340] bg-[#171630]", kind: "text-[#6F6A8E]" },
  active: {
    box: "border-violet-500 bg-[#211B44] shadow-[0_0_0_3px_rgba(91,54,232,0.18)]",
    kind: "text-[#8A7BD8]",
  },
  action: { box: "border-[#2A5240] bg-[#16281F]", kind: "text-[#6FBF95]" },
};

function Diagram() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden h-[400px] min-w-[812px] flex-1 overflow-hidden rounded-[18px] border border-[#262340] bg-[#121121] bg-[radial-gradient(#2A2745_1px,transparent_1px)] bg-[size:22px_22px] min-[1400px]:block"
    >
      <svg width="812" height="400" viewBox="0 0 812 400" className="absolute inset-0">
        <path d="M212 118 C 262 118, 262 106, 312 106" fill="none" stroke="#4B3E8C" strokeWidth="2" />
        <path d="M212 118 C 262 118, 262 200, 312 200" fill="none" stroke="#4B3E8C" strokeWidth="2" />
        <path d="M212 118 C 262 118, 262 294, 312 294" fill="none" stroke="#4B3E8C" strokeWidth="2" />
        <path d="M512 106 C 562 106, 562 200, 612 200" fill="none" stroke="#4B3E8C" strokeWidth="2" />
        <path d="M512 200 C 562 200, 562 200, 612 200" fill="none" stroke="#5B36E8" strokeWidth="2.4" />
        <path d="M512 294 C 562 294, 562 200, 612 200" fill="none" stroke="#4B3E8C" strokeWidth="2" />
      </svg>
      {NODES.map((node) => (
        <div
          key={node.label}
          style={{ left: node.left, top: node.top, width: node.width }}
          className={cn("absolute rounded-[12px] border px-3.5 py-[13px]", NODE_STYLES[node.tone].box)}
        >
          <div className={cn("font-mono text-[10.5px] tracking-[0.1em] uppercase", NODE_STYLES[node.tone].kind)}>
            {node.kind}
          </div>
          <div className="mt-[7px] flex items-center gap-2 text-[13.5px] font-semibold text-ink-fg-strong">
            {node.tone === "trigger" ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="size-4 text-violet-300">
                <circle cx="6" cy="6" r="2.5" />
                <circle cx="6" cy="18" r="2.5" />
                <path d="M6 8.5v7" />
                <path d="M8.5 6h6a3 3 0 0 1 3 3v6" />
              </svg>
            ) : null}
            {node.label}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkflowShowcase() {
  return (
    <section id="workflows" className="scroll-mt-[76px] border-b border-ink-line bg-ink-950 px-4 py-16 sm:px-8 lg:px-16 lg:py-[76px]">
      <div className="mx-auto flex max-w-[1312px] items-center gap-14">
        <div className="max-w-[640px] min-[1400px]:w-[440px] min-[1400px]:shrink-0">
          <SectionLabel>Workflow builder</SectionLabel>
          <h2 className="mt-3 font-display text-[32px] leading-[1.08] font-bold tracking-[-0.03em] text-ink-fg-strong sm:text-[40px]">
            Drag the pipeline you actually wanted
          </h2>
          <p className="mt-[18px] text-base leading-[1.62] text-[#9C96BE]">
            Triggers on the left, review passes in the middle, actions on the right. Each node exposes
            its own settings in the inspector — review focus, severity threshold, target channel.
          </p>
          <ul className="mt-6 flex flex-col gap-3">
            {POINTS.map((point) => (
              <li key={point} className="flex items-start gap-[11px] text-[14.5px] text-ink-muted">
                <CheckIcon className="mt-0.5 size-[18px] text-[#7FD3A6]" />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href="/workflow"
            className="mt-7 inline-flex items-center gap-2 rounded-[11px] bg-violet-500 px-5 py-[13px] text-[15px] font-semibold text-white hover:bg-violet-600 hover:text-white"
          >
            Open the builder
            <ArrowRight className="size-4" />
          </Link>
        </div>
        <Diagram />
      </div>
    </section>
  );
}
