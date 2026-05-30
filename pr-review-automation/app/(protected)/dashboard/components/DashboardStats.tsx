import { Bot, Cat, GitPullRequest, ShieldCheck } from "lucide-react";

import StatsCard from "./StatsCard";

export default function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatsCard
        icon={GitPullRequest}
        title="Active Workflows"
        value="12"
        growth="20% from last week"
      />

      <StatsCard
        icon={Cat}
        title="PRs Reviewed"
        value="245"
        growth="18% from last week"
      />

      <StatsCard
        icon={Bot}
        title="AI Suggestions"
        value="932"
        growth="32% from last week"
      />

      <StatsCard
        icon={ShieldCheck}
        title="Issues Prevented"
        value="67"
        growth="15% from last week"
      />
    </div>
  );
}
