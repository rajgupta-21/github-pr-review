import { CallToAction, MarketingFooter } from "./_components/cta-footer";
import { Features } from "./_components/features";
import { Hero } from "./_components/hero";
import { HowItWorks } from "./_components/how-it-works";
import { MarketingNav } from "./_components/marketing-nav";
import { StatBand } from "./_components/stat-band";
import { WorkflowShowcase } from "./_components/workflow-showcase";

export default function Home() {
  return (
    <>
      <MarketingNav />
      <main>
        <Hero />
        <StatBand />
        <HowItWorks />
        <Features />
        <WorkflowShowcase />
        <CallToAction />
      </main>
      <MarketingFooter />
    </>
  );
}
