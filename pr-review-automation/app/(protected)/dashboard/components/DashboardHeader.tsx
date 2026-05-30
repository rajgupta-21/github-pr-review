"use client";

import { Bell, Plus } from "lucide-react";

export default function DashboardHeader() {
  return (
    <div className="flex justify-between ">
      <div>
        <h1 className="text-4xl font-bold">Welcome back, Raj 👋</h1>

        <p className="text-gray-500 mt-2">
          Here&#39;s what&#39;s happening with your repositories today.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Bell className="text-gray-500" />

        <button className="bg-[#5B36E8] hover:bg-[#4C2EE0] text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all">
          <Plus size={18} />
          Create Workflow
        </button>
      </div>
    </div>
  );
}
