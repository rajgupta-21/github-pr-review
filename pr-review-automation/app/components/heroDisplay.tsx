"use client";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { DynamicButton } from "./button";
import CardSectionForHero from "./cardSectionForHero";

const HeroDisplay = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-6">
      {/*glowing Tag*/}
      <div className="flex bg-violet-500/20 backdrop-blur-2xl p-2 size-fit rounded-2xl items-center">
        <Star size={15} color="violet" />
        <div className=" text-violet-500">AI-Powered Github Automation</div>
      </div>

      <div className="flex flex-col">
        {/*headline*/}
        <span className="text-5xl font-extrabold text-black/80">
          Automate Pull Request
        </span>
        <div className="flex gap-2">
          <span className="text-black/80 font-bold text-5xl">Reviews with</span>
          <span className=" font-bold text-5xl text-[#4017e3]">AI</span>
        </div>
      </div>
      {/*content for hero section*/}
      <div className="flex flex-col">
        <span className="">
          Save time , improve code quality , and ship faster. Our AI agents
        </span>
        <span className="">
          analyze,review,and automate your GitHub workflows
        </span>
      </div>
      {/* Buttons */}
      <div className="">
        <DynamicButton
          className="p-7 bg-[#4017e3]/90   hover:bg-[#4017e3] rounded-lg"
          onClick={() => {
            router.push("/register");
          }}
        >
          {" "}
          Get started
        </DynamicButton>
      </div>
      {/*Card section for hero */}
      <div className="">
        <CardSectionForHero />
      </div>
    </div>
  );
};

export default HeroDisplay;
