"use client";

import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Repository } from "../../dashboard/components/DashboardHeader";

const TabForRepos = () => {
  const [isActive, setIsActive] = useState<"All Repositories" | "Connected">(
    "All Repositories",
  );

  const [repos, setRepos] = useState<Repository[]>([]);
  const [connectedRepos, setConnectedRepos] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  const handleRepoFetch = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:4000/user/repo", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        setError(true);
        return;
      }

      const data: Repository[] = await response.json();

      setRepos(data);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (repo: Repository) => {
    setConnectedRepos((prev) => {
      if (prev.includes(repo.id)) {
        return prev;
      }

      return [...prev, repo.id];
    });
  };

  useEffect(() => {
    handleRepoFetch();
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

  return (
    <div className="flex flex-col gap-4 m-4">
      {/* Tabs */}
      <div className="flex gap-10 border-b pb-2">
        <button
          className={`cursor-pointer font-medium transition-colors ${
            isActive === "All Repositories"
              ? "text-[#5B36E8] underline underline-offset-12"
              : "text-gray-500"
          }`}
          onClick={() => setIsActive("All Repositories")}
        >
          All Repositories ({repos.length})
        </button>

        <button
          className={`cursor-pointer font-medium transition-colors ${
            isActive === "Connected"
              ? "text-[#5B36E8] underline underline-offset-12"
              : "text-gray-500"
          }`}
          onClick={() => setIsActive("Connected")}
        >
          Connected ({connectedRepoList.length})
        </button>
      </div>

      {/* Repository List */}
      <div className="rounded-lg">
        {(isActive === "All Repositories" ? repos : connectedRepoList).map(
          (repo) => {
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

                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <span>{repo.owner}</span>

                      {repo.language && (
                        <>
                          <span>•</span>
                          <span className="bg-green-100 py-1 px-2 rounded-lg">
                            {repo.language}
                          </span>
                        </>
                      )}

                      <span>•</span>

                      <span className="bg-blue-100 py-1 px-2 rounded-lg">
                        {repo.private ? "Private" : "Public"}
                      </span>
                    </div>
                  </div>
                </div>

                {isConnected ? (
                  <button
                    disabled
                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                  >
                    Connected ✓
                  </button>
                ) : (
                  <button
                    onClick={() => handleConnect(repo)}
                    className="bg-[#5B36E8] hover:bg-[#4C2EE0] text-white px-4 py-2 rounded-lg transition-all cursor-pointer"
                  >
                    Connect
                  </button>
                )}
              </div>
            );
          },
        )}

        {isActive === "Connected" && connectedRepoList.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No connected repositories yet.
          </div>
        )}

        {repos.length === 0 && !loading && (
          <div className="py-12 text-center text-gray-500">
            No repositories found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TabForRepos;
