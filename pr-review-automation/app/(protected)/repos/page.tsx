"use client";

import { BookMarked, Check, Plus, RefreshCw, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { SidebarShell } from "@/components/shell/app-shell";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorBanner, LoadingState } from "@/components/ui/feedback";
import { Tabs } from "@/components/ui/segmented";

import { AvailableList } from "./_components/available-list";
import { ConnectedTable } from "./_components/connected-table";
import { FilterSelect, SearchField } from "./_components/toolbar";
import { hasWorkflow, needsAttention, useRepositories } from "./_components/use-repositories";

type Tab = "connected" | "available" | "attention";
type Visibility = "all" | "private" | "public";
type WorkflowFilter = "all" | "missing" | "configured";
type Sort = "recent" | "name";

function matches(query: string, ...fields: Array<string | null | undefined>) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return fields.some((field) => field?.toLowerCase().includes(needle));
}

export default function RepositoriesPage() {
  const repos = useRepositories();
  const [tab, setTab] = useState<Tab>("connected");
  const [query, setQuery] = useState("");
  const [language, setLanguage] = useState("all");
  const [visibility, setVisibility] = useState<Visibility>("all");
  const [workflow, setWorkflow] = useState<WorkflowFilter>("all");
  const [sort, setSort] = useState<Sort>("recent");

  const attention = repos.connected.filter(needsAttention);

  const languages = useMemo(() => {
    const source = tab === "available" ? repos.available : repos.connected;
    return [...new Set(source.map((repo) => repo.language).filter(Boolean) as string[])].sort();
  }, [tab, repos.available, repos.connected]);

  const connectedRows = useMemo(() => {
    const base = tab === "attention" ? attention : repos.connected;
    return base
      .filter((repo) => matches(query, repo.fullName, repo.owner))
      .filter((repo) => language === "all" || repo.language === language)
      .filter((repo) => visibility === "all" || repo.visibility === visibility)
      .filter(
        (repo) =>
          workflow === "all" || (workflow === "configured" ? hasWorkflow(repo) : !hasWorkflow(repo)),
      )
      .sort((a, b) =>
        sort === "name"
          ? a.fullName.localeCompare(b.fullName)
          : new Date(b.workflow?.updatedAt || b.updatedAt).getTime() -
            new Date(a.workflow?.updatedAt || a.updatedAt).getTime(),
      );
  }, [tab, attention, repos.connected, query, language, visibility, workflow, sort]);

  const availableRows = useMemo(
    () =>
      repos.available
        .filter((repo) => matches(query, repo.fullName, repo.owner))
        .filter((repo) => language === "all" || repo.language === language)
        .filter(
          (repo) =>
            visibility === "all" || (visibility === "private" ? repo.private : !repo.private),
        )
        .sort((a, b) => a.fullName.localeCompare(b.fullName)),
    [repos.available, query, language, visibility],
  );

  const switchTab = (next: Tab) => {
    setTab(next);
    setLanguage("all");
    setWorkflow("all");
  };

  const filtering =
    query.trim() !== "" || language !== "all" || visibility !== "all" || workflow !== "all";
  const clearFilters = () => {
    setQuery("");
    setLanguage("all");
    setVisibility("all");
    setWorkflow("all");
  };

  const summary = repos.loading
    ? "Loading your repositories…"
    : repos.githubError
      ? `${repos.connected.length} ${repos.connected.length === 1 ? "repository is" : "repositories are"} connected to Mergegate.`
      : `${repos.connected.length} of ${repos.githubTotal} repositories on your GitHub account are connected to Mergegate.`;

  return (
    <SidebarShell
      variant="rail"
      className="py-[22px]"
      header={
        <div className="-mb-3 w-full pt-3.5">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[13px] text-fg-subtle">
            <Link href="/dashboard" className="text-fg-subtle hover:text-fg">
              Workspace
            </Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-fg">
              Repositories
            </span>
          </nav>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-display text-[30px] leading-tight font-bold tracking-[-0.025em] text-fg">
                Repositories
              </h1>
              <p className="mt-[7px] text-[15px] text-fg-muted">{summary}</p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="tertiary"
                className="h-10 px-[15px]"
                onClick={repos.reload}
                disabled={repos.loading}
              >
                <RefreshCw className={repos.loading ? "animate-spin" : ""} aria-hidden="true" />
                Resync from GitHub
              </Button>
              <Button variant="primary" className="h-10" onClick={() => switchTab("available")}>
                <Plus aria-hidden="true" />
                Connect repository
              </Button>
            </div>
          </div>
          <Tabs
            className="mt-[22px] border-b-0"
            value={tab}
            onChange={switchTab}
            tabs={[
              { value: "connected", label: "Connected", count: repos.connected.length },
              { value: "available", label: "Available", count: repos.available.length },
              { value: "attention", label: "Needs attention", count: attention.length },
            ]}
          />
        </div>
      }
    >
      {repos.error ? (
        <ErrorBanner className="mb-4">
          {repos.error}.{" "}
          <button type="button" onClick={repos.reload} className="font-semibold underline">
            Try again
          </button>
        </ErrorBanner>
      ) : null}
      {repos.connectError ? <ErrorBanner className="mb-4">{repos.connectError}</ErrorBanner> : null}

      <div className="flex flex-wrap items-center gap-2.5">
        <SearchField
          value={query}
          onChange={setQuery}
          label="Filter repositories"
          placeholder="Filter by name or owner"
        />
        <FilterSelect
          label="Language"
          value={language}
          allValue="all"
          onChange={setLanguage}
          options={[
            { value: "all", label: "All" },
            ...languages.map((name) => ({ value: name, label: name })),
          ]}
        />
        <FilterSelect<Visibility>
          label="Visibility"
          value={visibility}
          allValue="all"
          onChange={setVisibility}
          options={[
            { value: "all", label: "All" },
            { value: "private", label: "Private" },
            { value: "public", label: "Public" },
          ]}
        />
        {tab !== "available" ? (
          <FilterSelect<WorkflowFilter>
            label="Workflow"
            value={workflow}
            allValue="all"
            onChange={setWorkflow}
            options={[
              { value: "all", label: "All" },
              { value: "missing", label: "Missing" },
              { value: "configured", label: "Configured" },
            ]}
          />
        ) : null}
        <div className="flex-1" />
        {tab !== "available" ? (
          <div className="flex items-center gap-2.5">
            <span className="text-[13.5px] text-fg-subtle">Sort</span>
            <FilterSelect<Sort>
              label="Sort"
              value={sort}
              onChange={setSort}
              options={[
                { value: "recent", label: "Recent activity" },
                { value: "name", label: "Name" },
              ]}
            />
          </div>
        ) : null}
      </div>

      <div className="mt-4">
        {repos.loading ? (
          <div className="rounded-xl border border-line bg-surface">
            <LoadingState label="Loading repositories…" />
          </div>
        ) : tab === "available" ? (
          repos.githubError ? (
            <ErrorBanner>
              Could not load repositories from GitHub: {repos.githubError}. Sign in with GitHub to
              list them.
            </ErrorBanner>
          ) : availableRows.length === 0 ? (
            <div className="rounded-xl border border-line bg-surface">
              {filtering ? (
                <EmptyState
                  icon={<Search />}
                  title="No repositories match these filters"
                  action={
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear filters
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Check />}
                  title="Everything is connected"
                  description="Every repository on your GitHub account is already connected to Mergegate."
                />
              )}
            </div>
          ) : (
            <AvailableList
              repos={availableRows}
              connecting={repos.connecting}
              onConnect={repos.connect}
            />
          )
        ) : connectedRows.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface">
            {filtering ? (
              <EmptyState
                icon={<Search />}
                title="No repositories match these filters"
                action={
                  <Button variant="secondary" size="sm" onClick={clearFilters}>
                    Clear filters
                  </Button>
                }
              />
            ) : tab === "attention" ? (
              <EmptyState
                icon={<Check />}
                title="Nothing needs attention"
                description="Every connected repository has a workflow and an active webhook."
              />
            ) : (
              <EmptyState
                icon={<BookMarked />}
                title="No repositories connected yet"
                description="Connect a repository from your GitHub account to start reviewing its pull requests."
                action={
                  <Button variant="primary" onClick={() => switchTab("available")}>
                    Browse available
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <ConnectedTable repos={connectedRows} />
        )}
      </div>

      {!repos.loading && tab !== "available" && repos.available.length > 0 ? (
        <div className="mt-5 flex flex-wrap items-center gap-5 rounded-xl border border-dashed border-[#D5D2CA] bg-[#FBFAF7] p-5 sm:flex-nowrap">
          <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[12px] border border-line bg-surface text-fg-muted">
            <Plus className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold text-fg">
              {repos.available.length} more{" "}
              {repos.available.length === 1 ? "repository" : "repositories"} available on your
              GitHub account
            </div>
            <div className="mt-1 text-[13.5px] text-fg-muted">
              Connecting one lets Mergegate read its pull requests. Save a workflow with a PR
              trigger to install the webhook and review automatically.
            </div>
          </div>
          <Button variant="secondary" onClick={() => switchTab("available")}>
            Browse available
          </Button>
        </div>
      ) : null}
    </SidebarShell>
  );
}
