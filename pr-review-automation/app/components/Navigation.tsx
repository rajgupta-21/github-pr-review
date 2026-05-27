"use client";

import { DynamicButton } from "./button";
import Navbar from "./navbar";


export function Navigation() {
  return (
    <div className=" bg-white flex justify-between p-4 px-20 mt-4 items-center rounded-sm">
      <div className="">somthing</div>
      {/*Navigation pending*/}
      <Navbar />
      <div className="flex gap-4">
        <DynamicButton className="text-sm font-bold border border-black bg-white text-black rounded-md p-5 hover:bg-mist-100 " onClick={()=>{}}>
          Log in
        </DynamicButton>
        <DynamicButton className="text-sm font-bold border border-blac rounded-md p-5 text-white bg-[#4017e3]/90 hover:bg-[#4017e3]">
          Register
        </DynamicButton>
      </div>
    </div>
  );
}
