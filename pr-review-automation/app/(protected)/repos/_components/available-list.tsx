"use client";

import { BookMarked, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GithubRepo } from "@/lib/types";
import { cn } from "@/lib/utils";

import { RepoMeta } from "./repo-meta";

/** GitHub repositories not yet connected, each with a Connect action. */
export function AvailableList({
  repos,
  connecting,
  onConnect,
}: {
  repos: GithubRepo[];
  connecting: number | null;
  onConnect: (repo: GithubRepo) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface">
      {repos.map((repo, index) => (
        <div
          key={repo.id}
          className={cn(
            "flex flex-wrap items-center gap-[13px] px-5 py-4 sm:flex-nowrap",
            index < repos.length - 1 && "border-b border-line-soft",
          )}
        >
          <span className="inline-flex size-[38px] shrink-0 items-center justify-center rounded-[11px] bg-surface-hover text-fg-subtle">
            <BookMarked className="size-[18px]" strokeWidth={1.9} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-semibold text-fg">{repo.fullName}</div>
            <RepoMeta language={repo.language} isPrivate={repo.private} branch={repo.defaultBranch} />
          </div>
          <div className="ml-[51px] flex items-center gap-1.5 sm:ml-0">
            <Button
              variant="secondary"
              size="sm"
              className="h-[34px] px-[13px]"
              loading={connecting === repo.id}
              disabled={connecting !== null}
              onClick={() => onConnect(repo)}
            >
              {connecting === repo.id ? "Connecting…" : "Connect"}
            </Button>
            <Button asChild variant="tertiary" size="icon-sm">
              <a
                href={repo.htmlUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${repo.fullName} on GitHub`}
                title="Open on GitHub"
              >
                <ExternalLink className="text-fg-muted" aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
