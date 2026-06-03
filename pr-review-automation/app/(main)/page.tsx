import FeatureOverview from "../components/featureOverview";
import FooterDisplay from "../components/footerDisplay";
import HeroDisplay from "../components/heroDisplay";

export default function Home() {
  return (
    <div className="w-full">
      <div className="flex flex-col gap-16 px-4 py-8 lg:px-10 lg:py-12">
        <div className="flex flex-col-reverse lg:flex-row gap-10 lg:items-center">
          <div className="w-full lg:w-1/2">
            <HeroDisplay />
          </div>
          <div className="w-full lg:w-1/2">
            <FeatureOverview />
          </div>
        </div>
        <FooterDisplay />
      </div>
    </div>
  );
}
