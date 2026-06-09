import Canvas from "./components/Canvas";
import WorkFlowHeader from "./components/workFlowHeader";

const WorkflowPage = () => {
  return (
    <div className="w-full h-screen bg-gray-100 overflow-hidden p-4">
      <div className="space-y-4 h-full">
        <WorkFlowHeader />
        <Canvas />
      </div>
    </div>
  );
};

export default WorkflowPage;
