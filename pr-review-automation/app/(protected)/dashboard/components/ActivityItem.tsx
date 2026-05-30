const activities = [
  "PR #241 reviewed by AI",
  "Workflow completed",
  "Security scan completed",
  "Auto Labeler added labels",
  "PR merged automatically",
];

export default function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex justify-between mb-6">
        <h2 className="font-bold text-xl">Recent Activity</h2>

        <button className="text-violet-600">View all</button>
      </div>

      <div className="space-y-5">
        {activities.map((activity) => (
          <div key={activity} className="flex gap-3 items-center">
            <div className="w-3 h-3 rounded-full bg-violet-500" />

            <div>{activity}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
