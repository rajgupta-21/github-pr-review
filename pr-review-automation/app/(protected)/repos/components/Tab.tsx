"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Repository } from "../../dashboard/components/DashboardHeader";

type ConnectedRepo = {
  repoId: number;
};

type ConnectedRepoResponse = {
  message: string;
  connectedRepos: ConnectedRepo[];
  action: string;
};

const TabForRepos = () => {
  const [isActive, setIsActive] = useState<"All Repositories" | "Connected">(
    "All Repositories",
  );

  const [repos, setRepos] = useState<Repository[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<number[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [connectingRepoId, setConnectingRepoId] = useState<number | null>(null);

  const fetchRepositories = async () => {
    const response = await fetch("http://localhost:4000/user/repo", {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch repositories");
    }

    const data: Repository[] = await response.json();

    setRepos(data);
  };

  const fetchConnectedRepositories = async () => {
    try {
      const response = await fetch("http://localhost:4000/repo/connected", {
        credentials: "include",
      });

      if (!response.ok) return;

      const data: ConnectedRepoResponse = await response.json();

      setConnectedRepos(data.connectedRepos.map((repo) => repo.repoId));
    } catch (error) {
      console.error(error);
    }
  };

  const initialize = async () => {
    try {
      setLoading(true);

      await Promise.all([fetchRepositories(), fetchConnectedRepositories()]);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectRepoToDb = async (
    owner: string,
    fullName: string,
    repoId: number,
  ) => {
    try {
      setConnectingRepoId(repoId);

      const response = await fetch("http://localhost:4000/repo/connect", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId: repoId,
          owner: owner,
          fullName: fullName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to connect repository");
      }

      setConnectedRepos((prev) => [...prev, repoId]);
    } catch (error) {
      console.error(error);
    } finally {
      setConnectingRepoId(null);
    }
  };

  useEffect(() => {
    initialize();
  }, []);

  const connectedRepoList = repos.filter((repo) =>
    connectedRepos.includes(repo.id),
  );

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading repositories...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">Failed to load repositories.</p>
      </div>
    );
  }

  const displayedRepos =
    isActive === "All Repositories" ? repos : connectedRepoList;

  return (
    <div className="flex flex-col gap-4 m-4">
      {/* Tabs */}
      <div className="flex gap-10 border-b pb-2">
        <button
          onClick={() => setIsActive("All Repositories")}
          className={`cursor-pointer font-medium transition-colors ${
            isActive === "All Repositories"
              ? "text-[#5B36E8] underline underline-offset-8"
              : "text-gray-500"
          }`}
        >
          All Repositories ({repos.length})
        </button>

        <button
          onClick={() => setIsActive("Connected")}
          className={`cursor-pointer font-medium transition-colors ${
            isActive === "Connected"
              ? "text-[#5B36E8] underline underline-offset-8"
              : "text-gray-500"
          }`}
        >
          Connected ({connectedRepoList.length})
        </button>
      </div>

      {/* Repo List */}
      <div className="rounded-lg">
        {displayedRepos.map((repo) => {
          const isConnected = connectedRepos.includes(repo.id);

          return (
            <div
              key={repo.id}
              className="border-b py-4 px-2 flex items-center justify-between hover:bg-gray-50 rounded-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <ChevronRight size={15} />

                <div>
                  <h3 className="font-medium">{repo.name}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 flex-wrap">
                    <span>{repo.owner}</span>

                    {repo.language && (
                      <>
                        <span>•</span>

                        <span className="bg-green-100 px-2 py-1 rounded-lg text-gray-600">
                          {repo.language}
                        </span>
                      </>
                    )}

                    <span>•</span>

                    <span className="bg-blue-100 px-2 py-1 rounded-lg">
                      {repo.private ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
              </div>

              {isConnected ? (
                <button
                  disabled
                  className="bg-green-100 text-gray-600 px-4 py-2 rounded-lg"
                >
                  Connected ✓
                </button>
              ) : (
                <button
                  disabled={connectingRepoId === repo.id}
                  onClick={() =>
                    handleConnectRepoToDb(repo.owner, repo.fullName, repo.id)
                  }
                  className="bg-[#5B36E8] hover:bg-[#4C2EE0] text-white px-4 py-2 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                >
                  {connectingRepoId === repo.id ? "Connecting..." : "Connect"}
                </button>
              )}
            </div>
          );
        })}

        {isActive === "Connected" && connectedRepoList.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No connected repositories yet.
          </div>
        )}

        {repos.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No repositories found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TabForRepos;
