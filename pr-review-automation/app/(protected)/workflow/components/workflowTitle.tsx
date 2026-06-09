import { Pencil } from "lucide-react";

const WorkflowTitle = () => {
  return (
    <div className="flex items-center justify-between py-5">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-gray-900">
            AI Code Review Workflow
          </h1>
        </div>

        <p className="mt-1 text-sm text-gray-500">
          Automatically review GitHub pull requests using AI and generate
          actionable feedback.
        </p>

        <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
          <span>8 Nodes</span>
          <span>•</span>
          <span>Last edited 2 mins ago</span>
          <span>•</span>
          <span>Auto Save Enabled</span>
        </div>
      </div>

      <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition">
        <Pencil size={16} />
        Edit Name
      </button>
    </div>
  );
};

export default WorkflowTitle;
