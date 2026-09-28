import Link from "next/link";

import { Logo } from "@/components/ui/brand";
import { githubLoginUrl } from "@/lib/api";

const LINKS = [
  { href: "#how", label: "How it works" },
  { href: "#features", label: "Features" },
  { href: "#workflows", label: "Workflows" },
];

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center gap-6 border-b border-ink-line bg-ink-950 px-4 sm:px-8 lg:gap-12 lg:px-16">
      <Logo href="/" size={26} className="[&>span]:text-[19px]" />

      <nav aria-label="Main" className="hidden flex-1 items-center gap-[30px] text-[14.5px] md:flex">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} className="text-ink-muted hover:text-ink-fg">
            {link.label}
          </a>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-3 md:ml-0">
        <Link
          href="/login"
          className="rounded-md border border-ink-line-strong px-[18px] py-[11px] text-[14.5px] font-medium text-ink-fg hover:bg-ink-850 hover:text-ink-fg"
        >
          Sign in
        </Link>
        <a
          href={githubLoginUrl}
          className="hidden rounded-md bg-violet-500 px-5 py-[11px] text-[14.5px] font-semibold text-white hover:bg-violet-600 hover:text-white sm:inline-flex"
        >
          Connect GitHub
        </a>
      </div>
    </header>
  );
}
