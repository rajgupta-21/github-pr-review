import { Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/feedback";
import { pluralize, timeAgo } from "@/lib/format";
import type { ConnectedRepo } from "@/lib/types";
import { cn } from "@/lib/utils";

import { hasWorkflow, type RepoPulls } from "./use-workspace";

type Event = {
  key: string;
  at: number;
  dot: string;
  body: React.ReactNode;
  meta: string;
};

const LIMIT = 6;

const Mono = ({ children }: { children: React.ReactNode }) => (
  <span className="font-mono text-[13px]">{children}</span>
);

/** Timeline built from what the backend actually records: connections, workflow saves, PR opens and merges. */
function buildEvents(pullsByRepo: RepoPulls[]): Event[] {
  const events: Event[] = [];

  for (const { repo, pulls } of pullsByRepo) {
    events.push({
      key: `connected-${repo._id}`,
      at: new Date(repo.createdAt).getTime(),
      dot: "bg-violet-500",
      body: (
        <>
          Connected <Mono>{repo.fullName}</Mono>
        </>
      ),
      meta: `${repo.webhookActive ? "Webhook active" : "No webhook yet"} · ${timeAgo(repo.createdAt)}`,
    });

    const nodes = repo.workflow?.nodes?.length ?? 0;
    if (nodes > 0 && repo.workflow?.updatedAt) {
      events.push({
        key: `workflow-${repo._id}`,
        at: new Date(repo.workflow.updatedAt).getTime(),
        dot: "bg-pass-solid",
        body: (
          <>
            Workflow <strong className="font-semibold">{repo.workflow.definition?.name || "saved"}</strong>{" "}
            saved on <Mono>{repo.name}</Mono>
          </>
        ),
        meta: `${pluralize(nodes, "node")} · ${timeAgo(repo.workflow.updatedAt)}`,
      });
    }

    for (const pr of pulls) {
      if (pr.mergedAtGithub) {
        events.push({
          key: `merged-${pr._id}`,
          at: new Date(pr.mergedAtGithub).getTime(),
          dot: "bg-pass-solid",
          body: (
            <>
              <Mono>
                {repo.name}#{pr.githubPrNumber}
              </Mono>{" "}
              merged into <Mono>{pr.targetBranch}</Mono>
            </>
          ),
          meta: `by ${pr.author?.login ?? "unknown"} · ${timeAgo(pr.mergedAtGithub)}`,
        });
      }
      events.push({
        key: `opened-${pr._id}`,
        at: new Date(pr.createdAtGithub).getTime(),
        dot: "bg-[#B0ACBD]",
        body: (
          <>
            <strong className="font-semibold">{pr.author?.login ?? "Someone"}</strong> opened{" "}
            <Mono>
              {repo.name}#{pr.githubPrNumber}
            </Mono>
          </>
        ),
        meta: timeAgo(pr.createdAtGithub),
      });
    }
  }

  return events
    .filter((event) => !Number.isNaN(event.at))
    .sort((a, b) => b.at - a.at)
    .slice(0, LIMIT);
}

export function RunActivity({ pullsByRepo }: { pullsByRepo: RepoPulls[] }) {
  const events = buildEvents(pullsByRepo);
  const idle: ConnectedRepo[] = pullsByRepo.map((entry) => entry.repo).filter((repo) => !hasWorkflow(repo));

  return (
    <Card>
      <CardHeader title="Recent activity" />

      {events.length === 0 ? (
        <EmptyState
          title="No activity yet"
          description="Connect a repository and open a pull request to see runs here."
          className="py-10"
        />
      ) : (
        <ol className="px-5 py-[18px]">
          {events.map((event, index) => {
            const last = index === events.length - 1;
            return (
              <li key={event.key} className="flex gap-3.5">
                <div className="flex w-2.5 shrink-0 flex-col items-center">
                  <span className={cn("mt-[5px] size-[9px] rounded-full", event.dot)} />
                  {last ? null : <span className="w-[1.5px] flex-1 bg-line" />}
                </div>
                <div className={cn("min-w-0", last ? "" : "pb-5")}>
                  <div className="text-sm text-fg">{event.body}</div>
                  <div className="mt-1 text-[12.5px] text-fg-subtle">{event.meta}</div>
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {idle.length > 0 ? (
        <div className="mx-5 mb-5 rounded-[13px] border border-violet-200 bg-violet-50 p-4">
          <div className="flex items-center gap-[9px]">
            <Sparkles className="size-[17px] text-violet-600" strokeWidth={1.9} aria-hidden="true" />
            <span className="text-sm font-semibold text-violet-900">
              {idle.length === 1 ? "One repo has" : `${idle.length} repos have`} no workflow
            </span>
          </div>
          <p className="mt-2 text-[13.5px] leading-[1.55] text-[#4A4270]">
            {idle.slice(0, 3).map((repo, index) => (
              <span key={repo._id}>
                {index > 0 ? (index === Math.min(idle.length, 3) - 1 ? " and " : ", ") : null}
                <Mono>{repo.fullName}</Mono>
              </span>
            ))}
            {idle.length > 3 ? ` and ${idle.length - 3} more` : null}{" "}
            {idle.length === 1 ? "is" : "are"} connected but idle.
          </p>
          <Button asChild variant="primary" size="sm" className="mt-3">
            <Link href={`/workflow?repoId=${idle[0].repoId}`}>Set up a workflow</Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
