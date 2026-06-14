import { ShieldCheck } from "lucide-react";
import { Handle, Position } from "reactflow";

export default function SecurityNode({ data }) {
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
      <Handle type="target" position={Position.Top} />

      <Handle type="source" position={Position.Bottom} />

      <div
        className="
flex
items-center
gap-3
p-4
bg-red-50
"
      >
        <div
          className="
p-2
rounded-lg
bg-red-100
"
        >
          <ShieldCheck size={20} className="text-red-600" />
        </div>

        <div>
          <h3 className="font-semibold">Security Scan</h3>

          <p className="text-xs text-gray-500">Checks vulnerabilities</p>
        </div>
      </div>

      <div className="p-3 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Scanner</span>

          <span className="font-medium">Snyk</span>
        </div>

        <div className="flex justify-between">
          <span>Severity</span>

          <span className="font-medium">High</span>
        </div>
      </div>
    </div>
  );
}
