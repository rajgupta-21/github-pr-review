import Link from "next/link";

import { LogoMark } from "@/components/ui/brand";
import { githubLoginUrl } from "@/lib/api";

import { ArrowRight } from "./section-label";

export function CallToAction() {
  return (
    <section className="border-b border-ink-line bg-[#17132E] bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] px-4 py-16 sm:px-8 lg:px-16 lg:py-0">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-8 lg:h-[300px] lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <div>
          <h2 className="font-display text-[32px] leading-[1.1] font-extrabold tracking-[-0.035em] text-ink-fg-strong sm:text-[44px]">
            Ship the next PR with a reviewer already on it.
          </h2>
          <p className="mt-3.5 text-base text-[#B0A9D8]">
            Connect a repository in under a minute. No CI changes.
          </p>
        </div>
        <a
          href={githubLoginUrl}
          className="inline-flex shrink-0 items-center gap-2.5 self-start rounded-[13px] bg-violet-500 px-7 py-[17px] text-base font-semibold text-white hover:bg-violet-600 hover:text-white lg:self-auto"
        >
          Connect GitHub
          <ArrowRight className="size-[17px]" />
        </a>
      </div>
    </section>
  );
}

const COLUMNS = [
  {
    title: "Product",
    links: [
      { href: "#how", label: "How it works" },
      { href: "#features", label: "Features" },
      { href: "#workflows", label: "Workflows" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Sign in" },
      { href: "/register", label: "Create an account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function MarketingFooter() {
  return (
    <footer className="bg-[#0A0912] px-4 pt-[52px] pb-14 sm:px-8 lg:px-16">
      <div className="mx-auto flex max-w-[1312px] flex-col gap-10 lg:flex-row lg:gap-[72px]">
        <div className="lg:w-[320px] lg:shrink-0">
          <div className="flex items-center gap-2.5">
            <LogoMark className="text-violet-500" />
            <span className="font-display text-lg font-extrabold text-ink-fg">Mergegate</span>
          </div>
          <p className="mt-4 text-sm leading-[1.6] text-[#6F6A8E]">
            AI pull-request review and workflow automation for GitHub teams.
          </p>
        </div>

        <div className="grid flex-1 grid-cols-2 gap-10 sm:grid-cols-4">
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <div className="text-[12.5px] tracking-[0.1em] text-[#55506F] uppercase">{column.title}</div>
              <ul className="mt-4 flex flex-col gap-[11px] text-sm">
                {column.links.map((link) => (
                  <li key={link.href}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href} className="text-[#9C96BE] hover:text-ink-fg">
                        {link.label}
                      </a>
                    ) : (
                      <Link href={link.href} className="text-[#9C96BE] hover:text-ink-fg">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
