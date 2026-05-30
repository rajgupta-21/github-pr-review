"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { sidbarNavItems } from "../constants/page";

const SidebarNav = () => {
  const pathname = usePathname();

  return (
    <aside className="text-white">
      <nav className="flex flex-col gap-2">
        {sidbarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`
                relative
                group
                flex
                items-center
                gap-3
                px-4
                py-3
                rounded-xl
                transition-all
                duration-200

                ${
                  isActive
                    ? "bg-[#271F55] text-white"
                    : "text-white hover:bg-[#271F55]"
                }
                ${isActive && "border border-[#6D6BE6]/30"}
              `}
            >
              <Icon
                size={20}
                className={`
                  transition-all
                  duration-200

                  ${
                    isActive
                      ? "text-[#6D6BE6] opacity-100"
                      : "opacity-50 group-hover:opacity-100 group-hover:text-[#6D6BE6]"
                  }
                `}
              />

              <span
                className={`
                  transition-all
                  duration-200

                  ${isActive ? "font-medium" : "group-hover:text-white"}
                `}
              >
                {item.page}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default SidebarNav;
