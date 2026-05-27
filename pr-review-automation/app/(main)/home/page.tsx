import FeatureOverview from "@/app/components/featureOverview";
import FooterDisplay from "@/app/components/footerDisplay";
import HeroDisplay from "@/app/components/heroDisplay";

const HomePage = () => {
  return (
    <div className="flex flex-col">
      <div className="flex bg-red-300">
        {/*Hero section*/}

        <div className="bg-blue-300">
          <HeroDisplay />
        </div>
        {/* Heilighted overview of features */}
        <div className="bg-green-300">
          <FeatureOverview />
        </div>
      </div>
      {/*Footer*/}
      <div className="bg-yellow-300">
        {/*Footer pending*/}
        <FooterDisplay />
      </div>
    </div>
  );
};

export default HomePage;
