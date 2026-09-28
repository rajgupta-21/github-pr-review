import { Suspense } from "react";

import { LoadingState } from "@/components/ui/feedback";

import WorkflowScreen from "./components/WorkflowScreen";

// useSearchParams (repo selection) needs a Suspense boundary.
export default function WorkflowPage() {
  return (
    <Suspense fallback={<LoadingState label="Loading workflows…" className="min-h-screen bg-paper" />}>
      <WorkflowScreen />
    </Suspense>
  );
}
