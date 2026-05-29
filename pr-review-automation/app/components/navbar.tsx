"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navitems } from "../constants/page";

const Navbar = () => {
  const pathname = usePathname();

  return (
    <div>
      <div className="flex gap-10">
        {navitems.map((items, index) => {
          const isActive = pathname === items.href;

          return (
            <Link
              key={index}
              href={items.href}
              className={`
                transition-all duration-200
                hover:underline
                hover:underline-offset-32
                decoration-2
                decoration-[#4017e3]/90

                ${
                  isActive
                    ? "text-[#4017e3] underline underline-offset-32"
                    : "hover:text-[#4017e3]"
                }
              `}
            >
              {items.page}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default Navbar;
