import { Code2 } from "lucide-react";

const CentralNode = () => {
  return (
    <div className="relative flex items-center justify-center ">
      {/* glow */}
      <div
        className="
          absolute
          w-52
          h-52
          rounded-[50px]
          bg-purple-500/5
        "
      />

      {/* main box */}
      <div
        className="
          relative
          w-30
          h-30
          rounded-[40px]
          bg-gradient-to-br
          from-fuchsia-500/80
          to-indigo-600/80
          shadow-[0_20px_80px_rgba(124,58,237,0.45)]/50
          flex
          items-center
          justify-center
        "
      >
        {/* inner icon box */}
        <div
          className="
            border-[3px]
            border-white
            rounded-2xl
            p-3
          "
        >
          <Code2 size={20} strokeWidth={3} className="text-white" />
        </div>
      </div>
    </div>
  );
};

export default CentralNode;
