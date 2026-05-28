import FeatureOverview from "@/app/components/featureOverview";
import FooterDisplay from "@/app/components/footerDisplay";
import HeroDisplay from "@/app/components/heroDisplay";

const HomePage = () => {
  return (
    <div className="flex flex-col gap-24 ">
      <div className="flex">
        {/*Hero section*/}

        <div className="p-16">
          <HeroDisplay />
        </div>
        {/* Heilighted overview of features */}
        <div className="bg-green-300">
          <FeatureOverview />
        </div>
      </div>
      {/*Footer*/}
      <div className="flex ">
        {/*Footer pending*/}
        <FooterDisplay />
      </div>
    </div>
  );
};

export default HomePage;
