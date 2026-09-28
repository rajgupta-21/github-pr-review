import { GithubMark } from "@/components/ui/brand";
import { githubLoginUrl } from "@/lib/api";

import { ArrowRight, CheckIcon } from "./section-label";

const SCORES = [
  { label: "Overall", value: 78, color: "text-ink-fg-strong" },
  { label: "Security", value: 54, color: "text-[#FF9AA8]" },
  { label: "Perf", value: 81, color: "text-[#FFCE8A]" },
  { label: "Quality", value: 90, color: "text-[#7FD3A6]" },
];

/* An illustrative review report, drawn in the dark marketing palette. */
function ProductShot() {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3.5">
      <div className="overflow-hidden rounded-xl border border-[#2C2946] bg-[#131223] shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
        <div className="flex h-[42px] items-center gap-2.5 border-b border-[#262340] bg-[#181731] px-4">
          {[0, 1, 2].map((dot) => (
            <span key={dot} aria-hidden="true" className="size-2.5 rounded-full bg-[#3C3860]" />
          ))}
          <span className="ml-2 truncate font-mono text-xs text-ink-subtle">mergegate · pull/218</span>
          <span className="ml-auto shrink-0 rounded-full bg-[#1E3B2C] px-[9px] py-[3px] text-[11.5px] font-medium text-[#7FD3A6]">
            Review posted
          </span>
        </div>

        <div className="flex flex-col gap-4 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-[34px] shrink-0 items-center justify-center rounded-md bg-[#2A2054]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[18px] text-violet-300">
                <rect x="4" y="8" width="16" height="12" rx="3" />
                <path d="M12 4v4" />
                <circle cx="9" cy="14" r="1" />
                <circle cx="15" cy="14" r="1" />
              </svg>
            </span>
            <div className="min-w-0">
              <div className="text-[14.5px] font-semibold text-ink-fg">
                Mergegate reviewed{" "}
                <span className="font-mono font-medium break-all text-violet-300">feat/session-refresh</span>
              </div>
              <div className="mt-[3px] text-[13px] text-ink-subtle">
                9 files · 284 additions · 61 deletions
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {SCORES.map((score) => (
              <div key={score.label} className="rounded-[11px] border border-[#2C2946] bg-[#171630] p-3">
                <div className="text-[11.5px] tracking-[0.06em] text-ink-subtle uppercase">{score.label}</div>
                <div className={`mt-1 font-display text-[26px] font-bold ${score.color}`}>{score.value}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 rounded-[12px] border border-[#4A2230] bg-[#1D1421] px-4 py-3.5">
            <span aria-hidden="true" className="w-[3px] shrink-0 rounded-[3px] bg-[#E0566F]" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-[9px]">
                <span className="rounded-full bg-[#3E1B26] px-[9px] py-[3px] text-[11.5px] font-semibold tracking-[0.03em] text-[#FF9AA8]">
                  CRITICAL
                </span>
                <span className="font-mono text-xs text-ink-subtle">src/auth/session.ts</span>
              </div>
              <div className="mt-[9px] text-[14.5px] font-semibold text-ink-fg-strong">
                Refresh token is signed without an expiry claim
              </div>
              <div className="mt-[5px] text-[13.5px] leading-[1.55] text-[#A9A3C8]">
                A token minted here never expires, so a leaked refresh token grants permanent access.
                Pass <span className="font-mono text-[#CFC6FF]">expiresIn: &apos;7d&apos;</span> to{" "}
                <span className="font-mono text-[#CFC6FF]">jwt.sign</span>.
              </div>
            </div>
          </div>

          <div className="flex gap-3 rounded-[12px] border border-[#2C2946] bg-[#171630] px-4 py-3.5">
            <span aria-hidden="true" className="w-[3px] shrink-0 rounded-[3px] bg-[#E0A24C]" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-[9px]">
                <span className="rounded-full bg-[#3A2A16] px-[9px] py-[3px] text-[11.5px] font-semibold tracking-[0.03em] text-[#FFCE8A]">
                  HIGH
                </span>
                <span className="font-mono text-xs text-ink-subtle">src/api/repos.ts</span>
              </div>
              <div className="mt-[9px] text-[14.5px] font-semibold text-ink-fg-strong">
                Repo list is fetched inside a loop — N+1 against the GitHub API
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 pl-1 text-[13px] text-[#6F6A8E]">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true" className="size-3.5 shrink-0">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5l3 2" />
        </svg>
        Posted straight to the PR thread as a single comment.
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section
      id="top"
      className="border-b border-ink-line bg-ink-950 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px] px-4 pt-14 pb-16 sm:px-8 lg:px-16 lg:pt-[84px] lg:pb-24"
    >
      <div className="mx-auto flex max-w-[1312px] flex-col gap-12 xl:flex-row xl:gap-14">
        <div className="flex flex-col gap-[26px] xl:w-[592px] xl:shrink-0">
          <div className="inline-flex items-center gap-[9px] self-start rounded-full border border-ink-600 bg-[#18142E] py-[7px] pr-3.5 pl-[9px]">
            <span className="inline-flex size-5 items-center justify-center rounded-full bg-violet-500 text-white">
              <CheckIcon className="size-3" />
            </span>
            <span className="text-[13px] font-medium tracking-[0.01em] text-[#CFC6FF]">
              Security, performance and quality on every PR
            </span>
          </div>

          <h1 className="font-display text-[44px] leading-[1.02] font-extrabold tracking-[-0.035em] text-ink-fg-strong sm:text-[58px] lg:text-[70px]">
            Your pull requests,
            <br />
            reviewed before
            <br />
            you ask.
          </h1>

          <p className="max-w-[500px] text-[17px] leading-[1.6] text-[#A9A3C8] sm:text-lg">
            Mergegate watches your repositories, reads every diff in context, and posts a
            reviewer-grade report on the PR — security, performance and quality, scored and cited
            by file.
          </p>

          <div className="mt-1.5 flex flex-wrap items-center gap-3">
            <a
              href={githubLoginUrl}
              className="inline-flex items-center gap-[9px] rounded-[12px] bg-violet-500 px-6 py-[15px] text-[15.5px] font-semibold text-white hover:bg-violet-600 hover:text-white"
            >
              <GithubMark size={17} />
              Connect a repository
            </a>
            <a
              href="#how"
              className="inline-flex items-center gap-[9px] rounded-[12px] border border-[#332F52] px-[22px] py-[15px] text-[15.5px] font-medium text-ink-fg hover:bg-ink-850 hover:text-ink-fg"
            >
              See how it works
              <ArrowRight className="size-4 text-[#9E97C4]" />
            </a>
          </div>

          <div className="mt-[18px] flex flex-wrap items-center gap-x-[22px] gap-y-2.5 border-t border-ink-line pt-6 text-[13.5px] text-ink-subtle">
            <span className="inline-flex items-center gap-[7px]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-[15px] text-[#5FB78F]">
                <path d="M12 3l7 3v6c0 4.2-2.9 7.6-7 9-4.1-1.4-7-4.8-7-9V6z" />
              </svg>
              Code never stored
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <CheckIcon className="size-[15px] text-[#5FB78F]" />
              Works with GitHub webhooks
            </span>
            <span className="inline-flex items-center gap-[7px]">
              <CheckIcon className="size-[15px] text-[#5FB78F]" />
              No CI config
            </span>
          </div>
        </div>

        <ProductShot />
      </div>
    </section>
  );
}
