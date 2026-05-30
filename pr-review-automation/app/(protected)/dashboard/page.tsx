import RecentActivity from "./components/ActivityItem";
import DashboardHeader from "./components/DashboardHeader";
import DashboardStats from "./components/DashboardStats";
import RecentWorkflows from "./components/WorkflowCard";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader />

      <DashboardStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivity />
        <RecentWorkflows />
      </div>
    </div>
  );
}
