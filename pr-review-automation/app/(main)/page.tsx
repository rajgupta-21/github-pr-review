import FeatureOverview from "../components/featureOverview";
import FooterDisplay from "../components/footerDisplay";
import HeroDisplay from "../components/heroDisplay";

export default function Home() {
  return (
    <div className="">
      <div className="flex flex-col  ">
        <div className="flex">
          {/*Hero section*/}

          <div className="p-16">
            <HeroDisplay />
          </div>
          {/* Heilighted overview of features */}
          <div className="p-5 pt-4">
            <FeatureOverview />
          </div>
        </div>
        {/*Footer*/}
        <div className="flex ">
          {/*Footer pending*/}
          <FooterDisplay />
        </div>
      </div>
    </div>
  );
}
