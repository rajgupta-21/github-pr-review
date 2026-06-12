"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";

export default function AIReviewPanel({ review }: { review: any }) {
  const severityColor = {
    Critical: "bg-red-600",
    High: "bg-orange-500",
    Medium: "bg-yellow-500",
    Low: "bg-blue-500",
  };

  return (
    <div className="space-y-5">
      {/* Summary */}

      <div className="bg-white border rounded-xl p-5">
        <div className="flex justify-between">
          <h2 className="font-semibold text-lg">AI Code Review</h2>

          <span
            className={`px-3 py-1 rounded-full text-xs text-white ${
              review.recommendation === "Approve"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {review.recommendation}
          </span>
        </div>

        <p className="text-gray-600 mt-3 text-sm">{review.summary}</p>
      </div>

      {/* Scores */}

      <div className="flex justify-between items-center ">
        <Score title="Overall" value={review.overallScore} />

        <Score title="Security" value={review.securityScore} />

        <Score title="Performance" value={review.performanceScore} />

        <Score title="Quality" value={review.qualityScore} />
      </div>

      {/* Findings */}

      <div className="space-y-3">
        <h2 className="font-semibold text-lg">
          Findings ({review.findings.length})
        </h2>

        {review.findings.map((item: any, index: number) => (
          <div key={index} className="bg-white border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2 items-center">
                <AlertTriangle size={18} />

                <h3 className="font-medium">{item.issue}</h3>
              </div>

              <span
                className={`text-white text-xs px-3 py-1 rounded-full ${severityColor[item.severity]}`}
              >
                {item.severity}
              </span>
            </div>

            <p className="text-xs text-gray-500 mt-2">File: {item.file}</p>

            <p className="mt-3 text-sm">{item.reason}</p>

            <div className="mt-3 bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold">Suggestion</p>

              <p className="text-sm">{item.suggestion}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Strengths */}

      <div className="bg-green-50 border border-green-200 rounded-xl p-5">
        <h2 className="font-semibold flex gap-2">
          <CheckCircle size={18} />
          Strengths
        </h2>

        <ul className="mt-3 space-y-2">
          {review.strengths.map((s: string, i: number) => (
            <li key={i} className="text-sm">
              ✓ {s}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Score({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white border rounded-xl px-4 py-2 flex flex-col">
      <p className="text-xs text-gray-500">{title}</p>

      <p className="text-2xl font-bold mt-2">{value}/10</p>
    </div>
  );
}
