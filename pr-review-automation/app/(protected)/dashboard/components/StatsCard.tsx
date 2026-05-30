import { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  title: string;
  value: string;
  growth: string;
}

export default function StatsCard({ icon: Icon, title, value, growth }: Props) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="flex justify-between">
        <div>
          <div className="text-gray-500 text-sm">{title}</div>

          <div className="text-4xl font-bold mt-2">{value}</div>

          <div className="text-green-500 mt-4">↑ {growth}</div>
        </div>

        <div className="w-14 h-14 rounded-xl bg-violet-100 flex items-center justify-center">
          <Icon className="text-violet-600" />
        </div>
      </div>
    </div>
  );
}
