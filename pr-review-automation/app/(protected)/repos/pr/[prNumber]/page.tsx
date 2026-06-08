"use client";
import { GitBranch, GitPullRequest } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
type PullRequestCard = {
  id: number;
  number: number;
  title: string;

  state: "open" | "closed";

  merged: boolean;
  merged_at: string | null;

  html_url: string;

  created_at: string;
  updated_at: string;

  comments: number;
  commits: number;

  changed_files: number;
  additions: number;
  deletions: number;

  user: {
    login: string;
    avatar_url: string;
  };

  head: {
    ref: string;
  };

  base: {
    ref: string;
  };
};
interface dataFetched {
  message: string;
  pr: PullRequestCard;
  action: string;
}

const PrDetails = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const { prNumber } = params;
  const userName = searchParams.get("userName");
  const repoName = searchParams.get("repoName");
  const userId = searchParams.get("userId");
  const [pullRequests, setPullRequests] = useState<
    PullRequestCard | undefined
  >();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
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

  const getStatus = () => {
    if (pullRequests?.merged) return "Merged";
    if (pullRequests?.state === "open") return "Open";
    return "Closed";
  };

  useEffect(() => {
    const handlefetchForPrbyNumber = async () => {
      if (!prNumber || !userName || !repoName || !userId) {
        setError(true);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `http://localhost:4000/user/pull-request/${userName}/${repoName}/${prNumber}/${userId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        const data: dataFetched = await response.json();
        console.log(data);
        setPullRequests(data.pr);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    handlefetchForPrbyNumber();
  }, [prNumber, userName, repoName, userId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-gray-600">
        Loading pull request details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-red-600">
        Could not load pull request. Check the URL params and try again.
      </div>
    );
  }
  console.log("pullrequest state: ", pullRequests);
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 text-gray-500 mb-3">
              <GitPullRequest size={18} />
              <span>Pull Request #{pullRequests?.number}</span>
            </div>

            <h1 className="text-3xl font-bold">{pullRequests?.title}</h1>

            <div className="flex items-center gap-3 mt-4">
              <img
                src={pullRequests?.user.avatar_url}
                alt={pullRequests?.user.login}
                className="w-10 h-10 rounded-full"
              />

              <div>
                <p className="font-medium">{pullRequests?.user.login}</p>

                <p className="text-sm text-gray-500">
                  Created {formatDate(pullRequests?.created_at)}
                </p>
              </div>
            </div>
          </div>

          <span
            className={`px-4 py-2 rounded-full font-medium ${
              pullRequests?.merged
                ? "bg-purple-100 text-purple-700"
                : pullRequests?.state === "open"
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
            }`}
          >
            {getStatus()}
          </span>
        </div>

        <div className="flex items-center gap-3 mt-6 text-gray-600">
          <GitBranch size={18} />

          <span className="bg-gray-100 px-3 py-1 rounded-lg">
            {pullRequests?.head.ref}
          </span>

          <span>→</span>

          <span className="bg-gray-100 px-3 py-1 rounded-lg">
            {pullRequests?.base.ref}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white border rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Files Changed</p>
          <h3 className="text-2xl font-bold">{pullRequests?.changed_files}</h3>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Additions</p>
          <h3 className="text-2xl font-bold text-green-600">
            +{pullRequests?.additions}
          </h3>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Deletions</p>
          <h3 className="text-2xl font-bold text-red-600">
            -{pullRequests?.deletions}
          </h3>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Comments</p>
          <h3 className="text-2xl font-bold">{pullRequests?.comments}</h3>
        </div>

        <div className="bg-white border rounded-2xl p-4">
          <p className="text-gray-500 text-sm">Commits</p>
          <h3 className="text-2xl font-bold">{pullRequests?.commits}</h3>
        </div>
      </div>

      {/* PR Information */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-semibold mb-5">Pull Request Information</h2>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-gray-500 text-sm">PR Number</p>
            <p className="font-medium">#{pullRequests?.number}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">State</p>
            <p className="font-medium">{pullRequests?.state}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Created</p>
            <p className="font-medium">
              {formatDate(pullRequests?.created_at)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Updated</p>
            <p className="font-medium">
              {formatDate(pullRequests?.updated_at)}
            </p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Merged At</p>
            <p className="font-medium">{formatDate(pullRequests?.merged_at)}</p>
          </div>

          <div>
            <p className="text-gray-500 text-sm">Author</p>
            <p className="font-medium">{pullRequests?.user.login}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <button className="px-5 py-3 bg-[#5B36E8] text-white rounded-xl hover:opacity-90">
          Run AI Review
        </button>

        <a
          href={pullRequests?.html_url}
          target="_blank"
          rel="noreferrer"
          className="px-5 py-3 border rounded-xl hover:bg-gray-50"
        >
          View on GitHub
        </a>
      </div>
    </div>
  );
};

export default PrDetails;
