import { GitPullRequest } from "lucide-react";
import { Handle, Position } from "reactflow";

interface Props {
  data: {
    label: string;
    event: string;
    repoName: string;
  };
}

export default function GithubWebhookNode({ data }: Props) {
  return (
    <div
      className="
w-64
rounded-xl
border
bg-white
shadow-md
overflow-hidden
"
    >
      <Handle type="target" position={Position.Left} />

      <Handle type="source" position={Position.Right} />

      <div
        className="
flex
items-center
gap-3
p-4
bg-purple-50
"
      >
        <div
          className="
p-2
rounded-lg
bg-purple-100
"
        >
          <GitPullRequest size={20} className="text-purple-600" />
        </div>

        <div>
          <h3 className="font-semibold">{data.label}</h3>

          <p className="text-xs text-gray-500">GitHub Trigger</p>
        </div>
      </div>

      <div className="p-3 text-sm space-y-1">
        <p>
          Repo:
          <span className="font-medium">{data.repoName}</span>
        </p>

        <p>
          Event:
          <span className="font-medium">{data.event}</span>
        </p>
      </div>
    </div>
  );
}
