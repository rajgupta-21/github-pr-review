"use client";

import { RepoDetails, RepoDetailsResponse } from "@/app/types/page";
import {
  AxeIcon,
  Check,
  Computer,
  Dot,
  GitPullRequest,
  MoreVertical,
  Settings,
  Workflow,
} from "lucide-react";
import { useEffect, useState } from "react";

type Tab = "overview" | "workflows" | "reviews" | "settings";

const TABS: { key: Tab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "workflows", label: "Workflows" },
  { key: "reviews", label: "PR Reviews" },
  { key: "settings", label: "Settings" },
];

function TabButton({
  label,
  isActive,
  onClick,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pb-4 font-medium cursor-pointer transition-colors ${
        isActive
          ? "border-b-2 border-[#5B36E8] text-[#5B36E8]"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      {label}
    </button>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between p-5">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border rounded-xl p-4">
      <span>{label}</span>
      <span className="text-green-600 font-medium">{value}</span>
    </div>
  );
}

function WorkflowCard() {
  return (
    <div className="mt-5 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <div className="bg-[#5B36E8]/10 p-3 rounded-lg">
          <AxeIcon className="text-[#5B36E8]" />
        </div>
        <div>
          <h3 className="font-semibold">Default PR Review Workflow</h3>
          <p className="text-gray-500 flex items-center text-sm">
            AI Review <Dot /> Comment on PR
          </p>
        </div>
      </div>
      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
        Active
      </span>
    </div>
  );
}

const RepositoryInfo = ({ repoId }: { repoId: number }) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [repo, setRepo] = useState<RepoDetails | undefined>(undefined);
  const [pullRequests, setPullRequests] = useState<unknown>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        setLoading(true);
        setError(false);
        setRepo(undefined);

        const repoRes = await fetch(
          `http://localhost:4000/user/repo/${repoId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!repoRes.ok) throw new Error("Failed to fetch repo");

        const repoData = (await repoRes.json()) as RepoDetailsResponse;
        const fetchedRepo = repoData.fetchData;
        setRepo(fetchedRepo);

        const { owner, name } = fetchedRepo;

        const prRes = await fetch(
          `http://localhost:4000/repo/pull-request/${owner}/${name}`,
          { method: "GET", credentials: "include" },
        );

        if (!prRes.ok) throw new Error("Failed to fetch PRs");

        const prData = await prRes.json();
        setPullRequests(prData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [repoId]);

  const formatDate = (dateStr?: string) =>
    dateStr ? new Date(dateStr).toLocaleDateString() : "—";

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl text-center text-gray-500">
        Loading repository details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl text-center text-red-600">
        Unable to load repository details.
      </div>
    );
  }

  if (!repo) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl text-center text-gray-500">
        Repository details are not available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Repository Header */}
      <div className="border border-gray-200 rounded-2xl p-6 bg-white">
        <div className="flex justify-between">
          {/* Left: icon + info */}
          <div className="flex gap-4">
            <div className="p-4 bg-[#5B36E8]/10 rounded-xl h-fit">
              <Computer className="text-[#5B36E8]" size={32} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{repo.name}</h1>
              <p className="text-gray-500 mt-1">{repo.description}</p>
              <div className="flex items-center gap-3 mt-4 text-gray-600 flex-wrap">
                <span>{repo.fullName}</span>
                <span className="flex items-center">
                  <Dot />
                  {repo.language ?? "Unknown"}
                </span>
                <span>{formatDate(repo.createdAt)}</span>
              </div>
            </div>
          </div>

          {/* Right: connected badge + menu */}
          <div className="flex items-start gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                repo.connected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Check size={16} />
              {repo.connected ? "Connected" : "Disconnected"}
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Tab bar — built from TABS array, no copy-paste */}
        <div className="flex gap-10 mt-8 border-b">
          {TABS.map((tab) => (
            <TabButton
              key={tab.key}
              label={tab.label}
              isActive={activeTab === tab.key}
              onClick={() => setActiveTab(tab.key)}
            />
          ))}
        </div>
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === "overview" && (
        <>
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <div className="p-5 border-b">
              <h2 className="font-semibold text-xl">Repository Details</h2>
            </div>
            <div className="divide-y">
              <DetailRow
                label="Repository ID"
                value={String(repo.repoId ?? "—")}
              />
              <DetailRow
                label="Default Branch"
                value={repo.defaultBranch ?? "—"}
              />

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Visibility</span>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    repo.visibility === "private"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {repo.visibility
                    ? repo.visibility.charAt(0).toUpperCase() +
                      repo.visibility.slice(1)
                    : "—"}
                </span>
              </div>

              <DetailRow
                label="Connected On"
                value={formatDate(repo.createdAt)}
              />

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Webhook Status</span>
                <span
                  className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm ${
                    repo.webhookActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Check size={14} />
                  {repo.webhookActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-white">
            <h2 className="font-semibold text-xl">Active Workflows</h2>
            <WorkflowCard />
          </div>
        </>
      )}

      {/* ── WORKFLOWS ── */}
      {activeTab === "workflows" && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <Workflow />
            <h2 className="text-xl font-semibold">Repository Workflows</h2>
          </div>
          <WorkflowCard />
        </div>
      )}

      {/* ── PR REVIEWS ── */}
      {activeTab === "reviews" && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <GitPullRequest />
            <h2 className="text-xl font-semibold">
              Recent Pull Request Reviews
            </h2>
          </div>

          {/* TODO: map over `pullRequests` once you define its type */}
          <div className="border rounded-xl p-4">
            <h3 className="font-medium">Fix Authentication Middleware</h3>
            <p className="text-sm text-gray-500 mt-1">Reviewed 3 hours ago</p>
            <div className="mt-3">
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                Approved
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── SETTINGS ── */}
      {activeTab === "settings" && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <Settings />
            <h2 className="text-xl font-semibold">Repository Settings</h2>
          </div>
          <div className="space-y-4">
            <SettingRow label="Webhook Status" value="Active" />
            <SettingRow label="Auto Review PRs" value="Enabled" />
            <SettingRow label="Repository Connection" value="Connected" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryInfo;
