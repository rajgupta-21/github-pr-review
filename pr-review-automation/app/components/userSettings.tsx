"use client";

import { useEffect, useState } from "react";

interface User {
  _id: string;
  email: string | null;
  role: string;
  githubConnected: boolean;
  githubId?: string;
  githubUsername?: string;
  githubAvatarUrl?: string;
  plan: string;
}

interface UserResponse {
  authenticated: boolean;
  user: User;
}

const UserSettings = () => {
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

  const firstLetter =
    data?.user?.githubUsername?.charAt(0).toUpperCase() ?? "?";

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="text-red-600 text-xl font-bold">Something Went Wrong</div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Avatar / Initial */}
      <div className="w-10 h-10 rounded-full bg-[#4017e3] text-white flex items-center justify-center font-bold">
        {firstLetter}
      </div>

      {/* User Info */}
      <div className="flex flex-col">
        <h1 className="font-semibold">
          {data?.user?.githubUsername ?? "User"}
        </h1>

        <span className="text-sm ">{data?.user?.plan}</span>
      </div>
    </div>
  );
};

export default UserSettings;
