"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Canvas from "./components/Canvas";
import WorkFlowHeader from "./components/workFlowHeader";

type WorkflowRepository = {
  repoId: number;
  name: string;
  fullName: string;
};

const WorkflowPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedRepoId, setSelectedRepoId] = useState<number | undefined>(
    undefined,
  );
  const [repos, setRepos] = useState<WorkflowRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const param = searchParams.get("repoId");
    const parsedRepoId = param ? Number(param) : undefined;
    setSelectedRepoId(
      parsedRepoId !== undefined && !Number.isNaN(parsedRepoId)
        ? parsedRepoId
        : undefined,
    );
  }, [searchParams]);

  useEffect(() => {
    const fetchRepoList = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:4000/repo/connected", {
          method: "GET",
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load connected repos");

        const data = await response.json();
        const connectedRepos = data.connectedRepos || [];

        const repoIds = connectedRepos.map(
          (repo: { repoId: number }) => repo.repoId,
        );
        const repoResponses = await Promise.all(
          repoIds.map((id: number) =>
            fetch(`http://localhost:4000/user/repo/${id}`, {
              method: "GET",
              credentials: "include",
            }),
          ),
        );

        const repoData = await Promise.all(
          repoResponses.map(async (res) => {
            if (!res.ok) throw new Error("Failed to load repo details");
            const json = await res.json();
            const fetched = json.fetchData;
            return {
              repoId: fetched.repoId,
              name: fetched.name,
              fullName: fetched.fullName,
            } as WorkflowRepository;
          }),
        );

        setRepos(repoData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRepoList();
  }, []);

  const handleSelectRepo = (repoIdToSelect: number) => {
    setSelectedRepoId(repoIdToSelect);
    router.replace(`/workflow?repoId=${repoIdToSelect}`);
  };

  return (
    <div className="w-full min-h-screen overflow-hidden p-4">
      <div className="space-y-4">
        <WorkFlowHeader />
        <div className="flex flex-col">
          <div className="space-y-4">
            {selectedRepoId ? (
              <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm flex items-center justify-between">
                <div className="text-sm font-medium text-gray-900">
                  Workflow repository selected.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRepoId(undefined);
                    router.replace("/workflow");
                  }}
                  className="rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Change repo
                </button>
              </div>
            ) : (
              <div className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold">
                    Workflow Repositories
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Choose a repository to load its workflow and PR data.
                  </p>
                </div>

                {loading ? (
                  <div className="text-sm text-gray-500">
                    Loading repositories...
                  </div>
                ) : error ? (
                  <div className="text-sm text-red-500">
                    Unable to load connected repositories.
                  </div>
                ) : repos.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No connected repositories found.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {repos.map((repo) => (
                      <button
                        key={repo.repoId}
                        type="button"
                        onClick={() => handleSelectRepo(repo.repoId)}
                        className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-left transition hover:border-purple-300"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">{repo.name}</h3>
                            <p className="mt-1 text-xs text-gray-500">
                              {repo.fullName}
                            </p>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                            Select
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Canvas selectedRepoId={selectedRepoId} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowPage;
