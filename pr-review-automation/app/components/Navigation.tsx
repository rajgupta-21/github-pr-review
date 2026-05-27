"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { DynamicButton } from "./button";
import Navbar from "./navbar";

export function Navigation() {
  const router = useRouter();

  return (
    <div
      className="
        bg-white/40
        flex
        flex-col
        lg:flex-row
        gap-6
        lg:gap-0
        justify-between
        items-center
        p-4
        sm:px-6
        lg:px-20
        mt-4
        rounded-sm
        w-full
      "
    >
      <div className="flex items-center gap-4 w-full lg:w-auto justify-center lg:justify-start">
        <Image src="/favicon.ico" alt="image" width={40} height={40} />

        <div className="flex-col text-center lg:text-left">
          <h1 className="font-bold">PR Automate</h1>

          <span className="text-xs">AI PR Review Automation</span>
        </div>
      </div>

      {/* navbar */}
      <div className="w-full lg:w-auto flex justify-center">
        <Navbar />
      </div>

      <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
        <DynamicButton
          className="
            text-sm
            font-bold
            border
            border-black
            bg-white
            text-black
            rounded-md
            p-5
            hover:bg-zinc-100
            w-full
            sm:w-auto
          "
          onClick={() => {
            router.push("/login");
          }}
        >
          Log in
        </DynamicButton>

        <DynamicButton
          className="
            text-sm
            font-bold
            border
            border-black
            rounded-md
            p-5
            text-white
            bg-[#4017e3]/90
            hover:bg-[#4017e3]
            w-full
            sm:w-auto
          "
          onClick={() => {
            router.push("/register");
          }}
        >
          Register
        </DynamicButton>
      </div>
    </div>
  );
}
