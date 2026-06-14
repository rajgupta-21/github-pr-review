import { Bell, CheckCircle, MessageSquare } from "lucide-react";
import { Handle, Position } from "reactflow";

const icons = {
  post_comment: MessageSquare,

  approve_pr: CheckCircle,

  slack_notify: Bell,
};

export default function ActionNode({ data }) {
  const Icon = icons[data.action] || MessageSquare;

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

      <div
        className="
flex
items-center
gap-3
p-4
bg-green-50
"
      >
        <div
          className="
p-2
rounded-lg
bg-green-100
"
        >
          <Icon size={20} className="text-green-600" />
        </div>

        <div>
          <h3 className="font-semibold">{data.label}</h3>

          <p className="text-xs text-gray-500">Workflow Action</p>
        </div>
      </div>

      <div className="p-3 text-sm">
        {data.action === "post_comment" && <p>Posts AI review comment on PR</p>}

        {data.action === "approve_pr" && <p>Approves GitHub Pull Request</p>}

        {data.action === "slack_notify" && <p>Sends Slack notification</p>}
      </div>

      <Handle type="source" position={Position.Right} />
    </div>
  );
}
