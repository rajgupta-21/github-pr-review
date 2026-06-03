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

const RepositoryInfo = ({ repoId }: { repoId: number }) => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [repoFetched, setRepoFetched] = useState<RepoDetails>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    const fetchRepoData = async () => {
      try {
        setError(false);
        setRepoFetched(undefined);
        setLoading(true);

        const response = await fetch(
          `http://localhost:4000/user/repo/${repoId}`,
          {
            method: "GET",
            credentials: "include",
          },
        );

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          throw new Error(errorBody?.message || "Failed to fetch repo");
        }

        const data = (await response.json()) as RepoDetailsResponse;
        setRepoFetched(data.fetchData);
        setError(false);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoData();
  }, [repoId]);

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl text-center">
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

  if (!repoFetched) {
    return (
      <div className="w-full max-w-5xl mx-auto p-6 bg-white rounded-2xl text-center text-gray-600">
        Repository details are not available.
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6">
      {/* Repository Header */}
      <div className="border border-gray-200 rounded-2xl p-6 bg-white">
        <div className="flex justify-between">
          <div className="flex gap-4">
            <div className="p-4 bg-[#5B36E8]/10 rounded-xl h-fit">
              <Computer className="text-[#5B36E8]" size={32} />
            </div>

            <div>
              <h1 className="text-3xl font-bold">{repoFetched?.name}</h1>

              <p className="text-gray-500 mt-1">{repoFetched?.description}</p>

              <div className="flex items-center gap-3 mt-4 text-gray-600 flex-wrap">
                <span>{repoFetched?.fullName}</span>

                <span className="flex items-center">
                  <Dot />
                  {repoFetched?.language ?? "Unknown"}
                </span>

                <span>
                  {repoFetched?.createdAt
                    ? new Date(repoFetched.createdAt).toLocaleDateString()
                    : "Unknown"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium ${
                repoFetched.connected
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-500"
              }`}
            >
              <Check size={16} />
              {repoFetched.connected ? "Connected" : "Disconnected"}
            </div>

            <button className="p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
              <MoreVertical size={18} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-10 mt-8 border-b">
          <button
            onClick={() => setActiveTab("overview")}
            className={`pb-4 font-medium cursor-pointer ${
              activeTab === "overview"
                ? "border-b-2 border-[#5B36E8] text-[#5B36E8]"
                : "text-gray-500"
            }`}
          >
            Overview
          </button>

          <button
            onClick={() => setActiveTab("workflows")}
            className={`pb-4 font-medium cursor-pointer ${
              activeTab === "workflows"
                ? "border-b-2 border-[#5B36E8] text-[#5B36E8]"
                : "text-gray-500"
            }`}
          >
            Workflows
          </button>

          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-4 font-medium cursor-pointer${
              activeTab === "reviews"
                ? "border-b-2 border-[#5B36E8] text-[#5B36E8]"
                : "text-gray-500"
            }`}
          >
            PR Reviews
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`pb-4 font-medium cursor-pointer${
              activeTab === "settings"
                ? "border-b-2 border-[#5B36E8] text-[#5B36E8]"
                : "text-gray-500"
            }`}
          >
            Settings
          </button>
        </div>
      </div>

      {/* OVERVIEW */}
      {activeTab === "overview" && (
        <>
          <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
            <div className="p-5 border-b">
              <h2 className="font-semibold text-xl">Repository Details</h2>
            </div>

            <div className="divide-y">
              <div className="flex justify-between p-5">
                <span className="text-gray-500">Repository ID</span>
                <span className="font-medium">
                  {repoFetched?.repoId ?? "—"}
                </span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Default Branch</span>
                <span className="font-medium">
                  {repoFetched?.defaultBranch ?? "—"}
                </span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Visibility</span>

                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    repoFetched?.visibility === "private"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {repoFetched?.visibility
                    ? repoFetched.visibility.charAt(0).toUpperCase() +
                      repoFetched.visibility.slice(1)
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Connected On</span>
                <span className="font-medium">
                  {repoFetched?.createdAt
                    ? new Date(repoFetched.createdAt).toLocaleDateString()
                    : "—"}
                </span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Webhook Status</span>

                <span
                  className={`px-3 py-1 rounded-full flex items-center gap-2 text-sm ${
                    repoFetched?.webhookActive
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Check size={14} />
                  {repoFetched?.webhookActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-2xl p-6 bg-white">
            <h2 className="font-semibold text-xl">Active Workflows</h2>

            <div className="mt-5 border border-gray-200 rounded-xl p-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="bg-[#5B36E8]/10 p-3 rounded-lg">
                  <AxeIcon className="text-[#5B36E8]" />
                </div>

                <div>
                  <h3 className="font-semibold">Default PR Review Workflow</h3>

                  <p className="text-gray-500 flex items-center text-sm">
                    AI Review
                    <Dot />
                    Comment on PR
                  </p>
                </div>
              </div>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                Active
              </span>
            </div>
          </div>
        </>
      )}

      {/* WORKFLOWS */}
      {activeTab === "workflows" && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <Workflow />
            <h2 className="text-xl font-semibold">Repository Workflows</h2>
          </div>

          <div className="space-y-4">
            <div className="border rounded-xl p-4 flex justify-between">
              <div>
                <h3 className="font-semibold">Default PR Review Workflow</h3>
                <p className="text-gray-500 text-sm">
                  Reviews every incoming PR
                </p>
              </div>

              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full h-fit">
                Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* PR REVIEWS */}
      {activeTab === "reviews" && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <GitPullRequest />
            <h2 className="text-xl font-semibold">
              Recent Pull Request Reviews
            </h2>
          </div>

          <div className="space-y-4">
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
        </div>
      )}

      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="border border-gray-200 rounded-2xl p-6 bg-white">
          <div className="flex items-center gap-3 mb-5">
            <Settings />
            <h2 className="text-xl font-semibold">Repository Settings</h2>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between border rounded-xl p-4">
              <span>Webhook Status</span>

              <span className="text-green-600 font-medium">Active</span>
            </div>

            <div className="flex justify-between border rounded-xl p-4">
              <span>Auto Review PRs</span>

              <span className="text-green-600 font-medium">Enabled</span>
            </div>

            <div className="flex justify-between border rounded-xl p-4">
              <span>Repository Connection</span>

              <span className="text-green-600 font-medium">Connected</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RepositoryInfo;
