"use client";

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
import { useState } from "react";

type Tab = "overview" | "workflows" | "reviews" | "settings";

const RepositoryInfo = () => {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

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
              <h1 className="text-3xl font-bold">Portfolio Website</h1>

              <p className="text-gray-500 mt-1">
                My personal portfolio built with Next.js and Tailwind CSS.
              </p>

              <div className="flex items-center gap-3 mt-4 text-gray-600 flex-wrap">
                <span>rajgupta-21/Portfolio-Website</span>

                <span className="flex items-center">
                  <Dot />
                  Next.js
                </span>

                <span>Updated 2 days ago</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-medium">
              <Check size={16} />
              Connected
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
                <span className="font-medium">845614512</span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Default Branch</span>
                <span className="font-medium">main</span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Visibility</span>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                  Public
                </span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Connected On</span>
                <span className="font-medium">June 03, 2026</span>
              </div>

              <div className="flex justify-between p-5">
                <span className="text-gray-500">Webhook Status</span>

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full flex items-center gap-2 text-sm">
                  <Check size={14} />
                  Active
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
