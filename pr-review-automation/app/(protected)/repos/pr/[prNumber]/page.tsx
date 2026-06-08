"use client";
import {
  dataFetched,
  GithubPullRequestFile,
  PullRequestCard,
} from "@/app/types/page";
import {
  BarChart2,
  Bot,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCode,
  GitBranch,
  GitCommit,
  GitMerge,
  GitPullRequest,
  Home,
  MessageSquare,
  Send,
  XCircle,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────
// These describe the shape of data coming back from the APIs

type Commit = {
  sha: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
  author: { login: string; avatar_url: string } | null;
};

type ReviewComment = {
  id: number;
  user: { login: string; avatar_url: string };
  body: string;
  path: string;
  line: number | null;
  created_at: string;
};

// A "timeline event" shows what happened to the PR over time
type TimelineEvent = {
  id: string;
  type: "opened" | "commit" | "review" | "merged" | "closed" | "comment";
  actor: string;
  avatar?: string;
  message: string;
  date: string;
};

// AI finding = one issue or praise found by the AI in a specific file
type AIFinding = {
  id: string;
  type: "security" | "performance" | "quality" | "positive";
  file: string;
  line: number | null;
  title: string;
  description: string;
  severity: "high" | "medium" | "low" | "info";
};

// ─── Dummy Data ───────────────────────────────────────────────────────────────
// Replace these with real API calls when you're ready

const DUMMY_COMMITS: Commit[] = [
  {
    sha: "a1b2c3d",
    commit: {
      message: "feat: add authentication middleware",
      author: { name: "Raj", date: "2024-06-08T10:30:00Z" },
    },
    author: {
      login: "raj-dev",
      avatar_url: "https://github.com/ghost.png",
    },
  },
  {
    sha: "e4f5g6h",
    commit: {
      message: "fix: handle token expiry edge case",
      author: { name: "Raj", date: "2024-06-08T12:15:00Z" },
    },
    author: { login: "raj-dev", avatar_url: "https://github.com/ghost.png" },
  },
  {
    sha: "i7j8k9l",
    commit: {
      message: "chore: update env variables and docs",
      author: { name: "Raj", date: "2024-06-08T14:45:00Z" },
    },
    author: { login: "raj-dev", avatar_url: "https://github.com/ghost.png" },
  },
];

const DUMMY_REVIEW_COMMENTS: ReviewComment[] = [
  {
    id: 1,
    user: { login: "senior-dev", avatar_url: "https://github.com/ghost.png" },
    body: "This logic should be extracted into a utility function. It will be reused in future PRs.",
    path: "src/middleware/auth.ts",
    line: 42,
    created_at: "2024-06-08T13:00:00Z",
  },
  {
    id: 2,
    user: { login: "team-lead", avatar_url: "https://github.com/ghost.png" },
    body: "Consider using `Promise.allSettled` here instead of `Promise.all` to handle partial failures gracefully.",
    path: "src/utils/api.ts",
    line: 88,
    created_at: "2024-06-08T15:30:00Z",
  },
];

const DUMMY_TIMELINE: TimelineEvent[] = [
  {
    id: "1",
    type: "opened",
    actor: "raj-dev",
    message: "opened this pull request",
    date: "2024-06-08T09:00:00Z",
  },
  {
    id: "2",
    type: "commit",
    actor: "raj-dev",
    message: "pushed 3 commits",
    date: "2024-06-08T10:30:00Z",
  },
  {
    id: "3",
    type: "review",
    actor: "senior-dev",
    message: "reviewed and left 2 comments",
    date: "2024-06-08T13:00:00Z",
  },
  {
    id: "4",
    type: "merged",
    actor: "team-lead",
    message: "merged this pull request",
    date: "2024-06-08T16:00:00Z",
  },
];

const DUMMY_AI_FINDINGS: AIFinding[] = [
  {
    id: "1",
    type: "security",
    file: "src/middleware/auth.ts",
    line: 15,
    title: "JWT secret exposed in code",
    description:
      "The JWT secret is hardcoded on line 15. Move it to an environment variable to prevent accidental leaks.",
    severity: "high",
  },
  {
    id: "2",
    type: "performance",
    file: "src/utils/api.ts",
    line: 88,
    title: "Sequential awaits can be parallelized",
    description:
      "Three consecutive `await` calls can be replaced with `Promise.all` to run them concurrently, reducing wait time.",
    severity: "medium",
  },
  {
    id: "3",
    type: "quality",
    file: "src/components/UserCard.tsx",
    line: 34,
    title: "Missing error boundary",
    description:
      "This component renders user data but has no error boundary. If the data is malformed, it will crash the whole page.",
    severity: "medium",
  },
  {
    id: "4",
    type: "positive",
    file: "src/middleware/auth.ts",
    line: null,
    title: "Good use of middleware pattern",
    description:
      "Authentication logic is cleanly separated from business logic. This is a solid pattern that scales well.",
    severity: "info",
  },
  {
    id: "5",
    type: "positive",
    file: "src/utils/api.ts",
    line: null,
    title: "Well-typed API responses",
    description:
      "All API response types are properly defined with TypeScript interfaces. Great for long-term maintainability.",
    severity: "info",
  },
];

// ─── DiffViewer ───────────────────────────────────────────────────────────────
// Same as your original — renders a git patch with color-coded lines
const DiffViewer = ({ patch }: { patch: string }) => {
  const lines = patch.split("\n");
  return (
    <div className="overflow-x-auto font-mono text-xs">
      {lines.map((line, index) => {
        const isAdded = line.startsWith("+") && !line.startsWith("+++");
        const isRemoved = line.startsWith("-") && !line.startsWith("---");
        const isMeta = line.startsWith("@@");
        return (
          <div
            key={index}
            className={`flex min-h-5 ${
              isAdded
                ? "bg-green-50"
                : isRemoved
                  ? "bg-red-50"
                  : isMeta
                    ? "bg-blue-50"
                    : ""
            }`}
          >
            <div className="w-10 shrink-0 text-right px-2 py-0.5 text-gray-400 border-r border-gray-200 select-none text-[11px]">
              {index + 1}
            </div>
            <div
              className={`flex-1 px-3 py-0.5 whitespace-pre-wrap break-all ${
                isAdded
                  ? "text-green-800"
                  : isRemoved
                    ? "text-red-800"
                    : isMeta
                      ? "text-blue-700 font-medium"
                      : "text-gray-700"
              }`}
            >
              {line || " "}
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ─── StatusBadge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ pr }: { pr: PullRequestCard }) => {
  if (pr.merged)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-600 text-white">
        <GitMerge size={13} /> Merged
      </span>
    );
  if (pr.state === "open")
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
        <GitPullRequest size={13} /> Open
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-600 text-white">
      <GitPullRequest size={13} /> Closed
    </span>
  );
};

// ─── File status badge colors ─────────────────────────────────────────────────
const fileStatusStyle: Record<string, string> = {
  added: "bg-green-100 text-green-800",
  modified: "bg-yellow-100 text-yellow-800",
  removed: "bg-red-100 text-red-800",
  renamed: "bg-blue-100 text-blue-800",
};

// ─── Timeline icon map ────────────────────────────────────────────────────────
const timelineIcon: Record<string, React.ReactNode> = {
  opened: <GitPullRequest size={14} className="text-green-600" />,
  commit: <GitCommit size={14} className="text-blue-600" />,
  review: <MessageSquare size={14} className="text-orange-500" />,
  merged: <GitMerge size={14} className="text-purple-600" />,
  closed: <XCircle size={14} className="text-red-500" />,
  comment: <MessageSquare size={14} className="text-gray-500" />,
};

// ─── StatCard ─────────────────────────────────────────────────────────────────
// Small card that shows a single metric — used in the stats row
const StatCard = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-lg">
    <div className={`p-2 rounded-md ${color}`}>{icon}</div>
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-semibold text-gray-800">{value}</p>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const PrDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { prNumber } = params;
  const userName = searchParams.get("userName");
  const repoName = searchParams.get("repoName");
  const userId = searchParams.get("userId");

  const [pullRequest, setPullRequest] = useState<PullRequestCard | undefined>();
  const [filesChanged, setFilesChanged] = useState<GithubPullRequestFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Tab state — which section is active
  // "files" | "info" | "commits" | "comments" | "timeline" | "ai"
  const [activeTab, setActiveTab] = useState<
    "files" | "info" | "commits" | "comments" | "timeline" | "ai"
  >("files");

  // Selected file index in the sidebar (null = nothing selected)
  const [selectedFile, setSelectedFile] = useState<number | null>(null);

  // AI review state
  const [aiRunning, setAiRunning] = useState(false);
  const [aiDone, setAiDone] = useState(false);

  // Post review state
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(false);

  // Filter for AI findings tab
  const [aiFilter, setAiFilter] = useState<
    "all" | "security" | "performance" | "quality" | "positive"
  >("all");

  const formatDate = (date?: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatShortDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    });

  useEffect(() => {
    if (!prNumber || !userName || !repoName || !userId) {
      setError(true);
      return;
    }

    const fetchPR = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `http://localhost:4000/user/pull-request/${userName}/${repoName}/${prNumber}/${userId}`,
          { method: "GET", credentials: "include" },
        );
        const data: dataFetched = await res.json();
        setPullRequest(data.pr);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    const fetchFiles = async () => {
      try {
        const res = await fetch(
          `http://localhost:4000/pr/files-changed/${userName}/${repoName}/${prNumber}/${userId}`,
          { method: "GET", credentials: "include" },
        );
        const data = await res.json();
        const files = data?.filesChanged ?? [];
        setFilesChanged(files);
        // Auto-select first file when data loads
        if (files.length > 0) setSelectedFile(0);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPR();
    fetchFiles();
  }, [prNumber, userName, repoName, userId]);

  // Simulate running the AI review (replace with real API call)
  const handleRunAI = () => {
    setAiRunning(true);
    setAiDone(false);
    setTimeout(() => {
      setAiRunning(false);
      setAiDone(true);
      setActiveTab("ai");
    }, 2000);
  };

  // Simulate posting review to GitHub (replace with real API call)
  const handlePostReview = () => {
    setPosting(true);
    setTimeout(() => {
      setPosting(false);
      setPosted(true);
    }, 1500);
  };

  if (loading)
    return (
      <div className="p-8 text-gray-500 text-sm">Loading pull request...</div>
    );
  if (error)
    return (
      <div className="p-8 text-red-500 text-sm">
        Could not load pull request. Check the URL params.
      </div>
    );

  const currentFile = selectedFile !== null ? filesChanged[selectedFile] : null;

  // Count AI findings by type — used in the AI tab header badges
  const findingCounts = {
    security: DUMMY_AI_FINDINGS.filter((f) => f.type === "security").length,
    performance: DUMMY_AI_FINDINGS.filter((f) => f.type === "performance")
      .length,
    quality: DUMMY_AI_FINDINGS.filter((f) => f.type === "quality").length,
    positive: DUMMY_AI_FINDINGS.filter((f) => f.type === "positive").length,
  };

  const filteredFindings =
    aiFilter === "all"
      ? DUMMY_AI_FINDINGS
      : DUMMY_AI_FINDINGS.filter((f) => f.type === aiFilter);

  return (
    <div className="w-full px-4 py-6 space-y-5">
      {/* ── Breadcrumb ── */}
      {/*
        Breadcrumb = a navigation trail showing where you are in the app.
        Example: Home > my-repo > Pull Requests > PR #42
        It helps users understand their location and navigate back.
      */}
      <nav className="flex items-center gap-1.5 text-xs text-gray-500">
        <Home size={12} />
        <ChevronRight size={12} />
        <span className="hover:text-gray-800 cursor-pointer">{repoName}</span>
        <ChevronRight size={12} />
        <span className="hover:text-gray-800 cursor-pointer">
          Pull Requests
        </span>
        <ChevronRight size={12} />
        <span className="text-gray-800 font-medium">#{prNumber}</span>
      </nav>

      {/* ── PR Summary Header ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
        {/* Title + status */}
        <div className="flex items-start gap-3">
          {pullRequest && <StatusBadge pr={pullRequest} />}
          <h1 className="text-xl font-semibold leading-snug">
            {pullRequest?.title}
          </h1>
        </div>

        {/* Author info + branch flow */}
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <img
            src={pullRequest?.user.avatar_url}
            className="w-5 h-5 rounded-full"
            alt="avatar"
          />
          <span className="font-medium text-gray-700">
            {pullRequest?.user.login}
          </span>
          <span>wants to merge</span>
          <GitBranch size={13} />
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
            {pullRequest?.head.ref}
          </code>
          <span>into</span>
          <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">
            {pullRequest?.base.ref}
          </code>
          <span className="ml-1">
            · opened {formatDate(pullRequest?.created_at)}
          </span>
        </div>

        {/* ── Stats Row ── */}
        {/*
          These StatCards are individual metric tiles.
          Each card shows an icon, a label, and a numeric value.
          This gives reviewers a quick at-a-glance summary without reading the diff.
        */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard
            icon={<FileCode size={15} className="text-blue-600" />}
            label="Files Changed"
            value={pullRequest?.changed_files ?? "—"}
            color="bg-blue-50"
          />
          <StatCard
            icon={<GitCommit size={15} className="text-indigo-600" />}
            label="Commits"
            value={pullRequest?.commits ?? "—"}
            color="bg-indigo-50"
          />
          <StatCard
            icon={<BarChart2 size={15} className="text-green-600" />}
            label="Additions"
            value={`+${pullRequest?.additions ?? 0}`}
            color="bg-green-50"
          />
          <StatCard
            icon={<BarChart2 size={15} className="text-red-600" />}
            label="Deletions"
            value={`-${pullRequest?.deletions ?? 0}`}
            color="bg-red-50"
          />
          <StatCard
            icon={<MessageSquare size={15} className="text-orange-600" />}
            label="Comments"
            value={pullRequest?.comments ?? "—"}
            color="bg-orange-50"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleRunAI}
            disabled={aiRunning}
            className="flex items-center gap-1.5 px-4 py-1.5 cursor-pointer bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 disabled:opacity-60"
          >
            <Bot size={14} />
            {aiRunning
              ? "Running AI Review..."
              : aiDone
                ? "Re-run AI Review"
                : "Run AI Review"}
          </button>

          {aiDone && (
            // "Post Review to GitHub" — only shows after AI review is complete
            <button
              onClick={handlePostReview}
              disabled={posting || posted}
              className="flex items-center gap-1.5 px-4 py-1.5 cursor-pointer bg-gray-800 text-white text-sm rounded-md hover:bg-gray-900 disabled:opacity-60"
            >
              <Send size={14} />
              {posting
                ? "Posting..."
                : posted
                  ? "Posted to GitHub ✓"
                  : "Post Review to GitHub"}
            </button>
          )}

          <a
            href={pullRequest?.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-4 py-1.5 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
          >
            <ExternalLink size={14} /> View on GitHub
          </a>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      {/*
        Tabs let us switch between different views of the same PR data
        without navigating to a new page. The activeTab state controls
        which panel is shown below.
      */}
      <div className="flex border-b border-gray-200 gap-0 overflow-x-auto">
        {[
          { id: "files", label: "Files changed", count: filesChanged.length },
          { id: "commits", label: "Commits", count: DUMMY_COMMITS.length },
          {
            id: "comments",
            label: "Review Comments",
            count: DUMMY_REVIEW_COMMENTS.length,
          },
          { id: "timeline", label: "Timeline" },
          { id: "info", label: "PR Details" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`px-4 py-2 text-sm flex items-center gap-1.5 border-b-2 whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? "border-blue-800 text-gray-900 font-medium"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            {tab.id === "ai" && <Bot size={13} />}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`text-xs rounded-full px-2 border ${
                  (tab as { highlight?: boolean }).highlight
                    ? "bg-purple-100 border-purple-300 text-purple-700"
                    : "bg-gray-100 border-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Files Changed                                                  */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "files" && (
        /*
          Two-column layout:
          - LEFT: sidebar with a list of changed files
          - RIGHT: full-width diff viewer for the selected file
          
          "flex" makes them sit side-by-side.
          "min-h-[500px]" ensures the panel doesn't collapse when empty.
        */
        <div className="flex border border-gray-200 rounded-xl overflow-hidden min-h-[500px]">
          {/* File Sidebar */}
          <div className="w-72 shrink-0 border-r border-gray-200 bg-gray-50 overflow-y-auto">
            <div className="px-3 py-3 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200 font-medium">
              Changed files — {filesChanged.length}
            </div>
            {filesChanged.map((file, i) => {
              const parts = file.filename.split("/");
              const name = parts.pop()!;
              const dir = parts.join("/");
              return (
                <button
                  key={file.sha}
                  onClick={() => setSelectedFile(i)}
                  className={`w-full text-left px-3 py-2.5 text-xs flex items-start gap-2 border-b border-gray-100 hover:bg-white transition-colors ${
                    selectedFile === i
                      ? "bg-white border-l-2 border-l-blue-800 pl-2.5"
                      : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    {dir && (
                      <span className="text-gray-400 block text-[10px]">
                        {dir}/
                      </span>
                    )}
                    <span className="font-medium text-gray-800 break-all">
                      {name}
                    </span>
                    {/* Additions / deletions count per file */}
                    <div className="flex gap-2 mt-0.5">
                      <span className="text-green-600 font-medium">
                        +{file.additions}
                      </span>
                      <span className="text-red-600 font-medium">
                        -{file.deletions}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-medium shrink-0 mt-0.5 ${
                      fileStatusStyle[file.status] ??
                      "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {file.status[0].toUpperCase()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Diff Panel — full width */}
          <div className="flex-1 overflow-auto min-w-0">
            {currentFile ? (
              <>
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                  <code className="text-sm font-medium text-gray-800">
                    {currentFile.filename}
                  </code>
                  <div className="flex gap-3 text-xs font-medium">
                    <span className="text-green-600">
                      +{currentFile.additions}
                    </span>
                    <span className="text-red-600">
                      -{currentFile.deletions}
                    </span>
                    <span className="text-gray-500">
                      {currentFile.changes} changes
                    </span>
                  </div>
                </div>
                {currentFile.patch ? (
                  <DiffViewer patch={currentFile.patch} />
                ) : (
                  <div className="flex items-center justify-center h-40 text-sm text-gray-400">
                    No diff available for this file
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-2 text-gray-400 text-sm">
                <GitPullRequest size={28} className="text-gray-300" />
                <span>Select a file to view its diff</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Commits                                                         */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "commits" && (
        /*
          A commit is a snapshot of changes at a point in time.
          This list shows every commit included in the PR,
          ordered from earliest to latest.
        */
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide font-medium">
            {DUMMY_COMMITS.length} Commits
          </div>
          <div className="divide-y divide-gray-100">
            {DUMMY_COMMITS.map((commit) => (
              <div
                key={commit.sha}
                className="flex items-center gap-4 px-4 py-3 hover:bg-gray-50"
              >
                <img
                  src={commit.author?.avatar_url}
                  className="w-7 h-7 rounded-full shrink-0"
                  alt="avatar"
                />
                <div className="flex-1 min-w-0">
                  {/* First line of commit message is the title */}
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {commit.commit.message.split("\n")[0]}
                  </p>
                  <p className="text-xs text-gray-500">
                    {commit.author?.login} ·{" "}
                    {formatShortDate(commit.commit.author.date)}
                  </p>
                </div>
                {/* SHA = short unique ID for the commit */}
                <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-mono">
                  {commit.sha.slice(0, 7)}
                </code>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Review Comments                                                 */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "comments" && (
        /*
          Review comments are attached to specific lines in specific files.
          They're different from PR-level comments — they point to exact code.
        */
        <div className="space-y-3">
          {DUMMY_REVIEW_COMMENTS.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-gray-400 text-sm border border-gray-200 rounded-xl">
              No review comments yet.
            </div>
          ) : (
            DUMMY_REVIEW_COMMENTS.map((comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                {/* File + line context bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border-b border-gray-200 text-xs text-gray-500">
                  <FileCode size={12} />
                  <code className="font-mono">{comment.path}</code>
                  {comment.line && (
                    <span className="ml-auto bg-gray-200 px-2 py-0.5 rounded text-gray-600">
                      Line {comment.line}
                    </span>
                  )}
                </div>
                {/* Comment body */}
                <div className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={comment.user.avatar_url}
                      className="w-5 h-5 rounded-full"
                      alt="avatar"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {comment.user.login}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {formatShortDate(comment.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{comment.body}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: Timeline                                                        */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "timeline" && (
        /*
          A timeline shows the full history of a PR as a vertical list of events.
          Each event has a type (opened, commit pushed, reviewed, merged, etc.)
          with an icon, actor name, message, and date.
          
          The vertical line on the left visually connects all events together.
        */
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wide font-medium">
            Activity Timeline
          </div>
          <div className="px-4 py-4 relative">
            {/* The vertical connector line */}
            <div className="absolute left-[27px] top-6 bottom-6 w-px bg-gray-200" />

            <div className="space-y-5">
              {DUMMY_TIMELINE.map((event) => (
                <div key={event.id} className="flex items-start gap-3 relative">
                  {/* Circle icon — sits on the connector line */}
                  <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 z-10">
                    {timelineIcon[event.type]}
                  </div>
                  <div className="flex-1 pt-0.5">
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{event.actor}</span>{" "}
                      {event.message}
                    </span>
                    <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                      <Clock size={11} />
                      {formatShortDate(event.date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* TAB: PR Details                                                      */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === "info" && (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-2">
            {[
              ["PR number", `#${pullRequest?.number}`],
              ["State", pullRequest?.state],
              ["Created", formatDate(pullRequest?.created_at)],
              ["Updated", formatDate(pullRequest?.updated_at)],
              ["Merged at", formatDate(pullRequest?.merged_at)],
              ["Author", pullRequest?.user.login],
            ].map(([label, value], i) => (
              <div
                key={label}
                className={`px-5 py-3.5 border-b border-gray-100 ${i % 2 === 0 ? "border-r border-gray-100" : ""}`}
              >
                <p className="text-xs text-gray-400 mb-1">{label}</p>
                <p className="text-sm font-medium">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PrDetails;
