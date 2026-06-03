"use client";

import { Bell, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
export interface Repository {
  id: number;
  name: string;
  fullName: string;
  owner: string;
  private: boolean;
  defaultBranch: string;
  language: string | null;
  htmlUrl: string;
}

export default function DashboardHeader({
  user,
}: {
  user: string | undefined;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [repo, setRepo] = useState<Repository[] | null>();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const router = useRouter();

  const handelModalOpen = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:4000/user/repo", {
        method: "GET",
        credentials: "include",
      });
      if (response.ok) {
        setLoading(false);
        const data: Repository[] = await response.json();
        setRepo(data);
      } else {
        setError(true);
      }
    } catch (error) {
      setLoading(false);
      setError(true);
      console.error(error);
    }
  };
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center justify-between">
      {/*DailogBox*/}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white w-full max-w-2xl rounded-2xl p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Your Repositories</h2>
              <div
                className="px-[6.5px]  rounded-full  bg-gray-200 group hover:bg-black"
                onClick={() => setIsOpen(false)}
              >
                <button className="text-gray-500 group-hover:text-white font-bold cursor-pointer">
                  ✕
                </button>
              </div>
            </div>
            {repo &&
              repo.map((repo) => {
                return (
                  <div key={repo.id} className=" max-h-100 overflow-y-auto">
                    <div className="border rounded-xl p-4 flex items-center justify-between ">
                      <div>
                        <h3 className="font-medium">{repo.name}</h3>

                        <p className="text-sm text-gray-500">{repo.owner}</p>
                      </div>

                      <button className="bg-[#5B36E8] text-white px-4 py-2 rounded-lg">
                        Connect
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
      <div>
        <h1 className="text-4xl font-bold">{`Welcome back, ${user}`}</h1>

        <p className="text-gray-500 mt-2">
          Here&#39;s what&#39;s happening with your repositories today.
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Bell className="text-gray-500" />

        <button className="bg-[#5B36E8] hover:bg-[#4C2EE0] text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer">
          <Plus size={18} />
          Create Workflow
        </button>
        <button
          className="bg-[#5B36E8] hover:bg-[#4C2EE0] text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          onClick={() => {
            handelModalOpen();
            setIsOpen(true);
          }}
        >
          Your Repositories
        </button>
        <button
          className="bg-[#5B36E8] hover:bg-[#4C2EE0] text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
          onClick={() => {
            router.push("/repos");
          }}
        >
          Connect Repositories
        </button>
      </div>
    </div>
  );
}
