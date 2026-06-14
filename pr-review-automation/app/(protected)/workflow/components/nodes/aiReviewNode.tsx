import { Bot } from "lucide-react";
import { Handle, Position } from "reactflow";

export default function AiReviewNode({ data }) {
  return (
    <div
      className="
w-64
rounded-xl
border
bg-white
shadow-md
"
    >
      <Handle type="target" position={Position.Left} />

      <Handle type="source" position={Position.Right} />

      <div
        className="
p-4
flex
gap-3
bg-blue-50
"
      >
        <div className="p-2 rounded-lg bg-blue-100">
          <Bot className="text-blue-600" />
        </div>

        <div>
          <h3 className="font-semibold">AI Code Review</h3>

          <p className="text-xs text-gray-500">Analyzes PR changes</p>
        </div>
      </div>

      <div className="p-3 text-sm">
        Model:
        <span className="font-medium">GPT</span>
      </div>
    </div>
  );
}
