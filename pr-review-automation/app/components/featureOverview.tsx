import CardComps from "@/components/ui/card";
import { cardItemsForLeft, cardItemsForRight } from "../constants/page";
import CentralNode from "./centralNode";

const FeatureOverview = () => {
  return (
    <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-12 xl:gap-20 items-center py-20 lg:py-32">
      {/* SVG CONNECTIONS */}
      <svg
        className="hidden lg:block absolute top-0 left-0 w-full h-full pointer-events-none z-1"
        viewBox="0 0 1400 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        {/* LEFT TOP */}
        <path
          d="M400 180 C450 180, 500 300, 650 350"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
          fill="none"
        />

        {/* LEFT MIDDLE */}
        <path
          d="M400 350 H650"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
        />

        {/* LEFT BOTTOM */}
        <path
          d="M400 520 C450 520, 500 400, 650 350"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
          fill="none"
        />

        {/* RIGHT TOP */}
        <path
          d="M750 350 C1000 300, 950 180, 1100 180"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
          fill="none"
        />

        {/* RIGHT MIDDLE */}
        <path
          d="M750 350 H1100"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
        />

        {/* RIGHT BOTTOM */}
        <path
          d="M750 350 C900 400, 950 520, 1100 520"
          stroke="#A78BFA"
          strokeWidth="3"
          strokeDasharray="10 12"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* LEFT CARDS */}
      <div className="relative z-10 overflow-hidden">
        <CardComps cards={cardItemsForLeft} />
      </div>

      {/* CENTER NODE */}
      <div className="relative z-10 flex justify-center">
        <CentralNode />
      </div>

      {/* RIGHT CARDS */}
      <div className="relative z-10 overflow-hidden">
        <CardComps cards={cardItemsForRight} />
      </div>
    </div>
  );
};

export default FeatureOverview;
