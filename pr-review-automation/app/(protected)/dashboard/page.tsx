"use client";
import { UserResponse } from "@/app/types/page";
import { useEffect, useState } from "react";
import RecentActivity from "./components/ActivityItem";
import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";
import RecentWorkflows from "./components/WorkflowCard";

export default function DashboardPage() {
  const [data, setData] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleUser = async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:4000/auth/me", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }

      const userData: UserResponse = await response.json();

      setData(userData);
    } catch (error) {
      console.error(error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleUser();
  }, []);

  return (
    <div className="flex flex-col gap-6 w-[80vw]">
      <DashboardHeader user={data?.user.githubUsername} />

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <RecentWorkflows />
      </div>
    </div>
  );
}
