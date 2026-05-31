"use client";
import { Code2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SidebarNav from "./sidebarNav";
import UserSettings from "./userSettings";

const SidebarForMain = () => {
  const router = useRouter();
  return (
    <div className="w-1/7 bg-[#141629] h-screen p-5 pt-10 pb-10 flex flex-col justify-between ">
      {/*For Icon*/}
      <div className="gap-20 flex flex-col">
        <div
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => {
            router.push("/Main");
          }}
        >
          <Code2 className="text-[#6D6BE6]" />
          <h1 className="font-bold text-xl text-[#6D6BE6]">PR Automate</h1>
        </div>
        {/*For navItems*/}
        <SidebarNav />
      </div>
      {/*User display*/}
      <div className="text-white">
        <UserSettings wantPlan={true} />
      </div>
    </div>
  );
};
export default SidebarForMain;
