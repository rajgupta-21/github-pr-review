const workflows = [
  {
    name: "AI PR Review",
    status: "Active",
    runs: 245,
  },
  {
    name: "Security Scanner",
    status: "Running",
    runs: 102,
  },
  {
    name: "Auto Labeler",
    status: "Active",
    runs: 431,
  },
  {
    name: "Auto Merge",
    status: "Paused",
    runs: 78,
  },
];

export default function RecentWorkflows() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex justify-between mb-6">
        <h2 className="font-bold text-xl">Recent Workflows</h2>

        <button className="text-violet-600">View all</button>
      </div>

      <div className="space-y-6">
        {workflows.map((workflow) => (
          <div key={workflow.name} className="flex justify-between">
            <div>
              <h3 className="font-medium">{workflow.name}</h3>
            </div>

            <div className="text-right">
              <div>{workflow.runs} runs</div>

              <span className="text-green-500">{workflow.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
