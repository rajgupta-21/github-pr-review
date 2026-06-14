import {
  Activity,
  CheckCircle,
  ChevronRight,
  Play,
  Settings,
} from "lucide-react";

const WorkFlowHeader = () => {
  return (
    <div className="flex items-center justify-between   ">
      {/* Left Section */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-500 hover:text-gray-800 cursor-pointer">
          Workflows
        </span>

        <ChevronRight size={16} className="text-gray-400" />

        <h1 className="text-sm font-semibold text-gray-900">
          AI Code Review Workflow
        </h1>

        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
          Active
        </span>

        <div className="flex items-center gap-1 text-sm text-gray-500 ml-2">
          <CheckCircle size={14} className="text-green-500" />
          Auto Saved
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <Activity size={16} />
          Executions
        </button>

        <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
          <Play size={16} />
          Test Workflow
        </button>

        <button className="p-2 rounded-xl cursor-pointer transition">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
};

export default WorkFlowHeader;
