"use client";

import { Search } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { CATEGORY_STYLE, PALETTE } from "./nodeCatalog";

/* Left node palette. Items are dragged onto the canvas (application/reactflow). */
export default function NodeSidebar() {
  const [query, setQuery] = useState("");
  const needle = query.trim().toLowerCase();

  const onDragStart = (event: React.DragEvent<HTMLDivElement>, nodeType: string) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("application/reactflow", nodeType);
  };

  const sections = PALETTE.map((section) => ({
    ...section,
    items: needle
      ? section.items.filter(
          (item) =>
            item.paletteLabel.toLowerCase().includes(needle) ||
            item.type.includes(needle.replace(/\s+/g, "_")),
        )
      : section.items,
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="flex w-[244px] shrink-0 flex-col overflow-hidden border-r border-line bg-surface">
      <div className="px-4 pt-4 pb-3">
        <div className="relative">
          <label htmlFor="node-search" className="sr-only">
            Search nodes
          </label>
          <Search
            className="pointer-events-none absolute top-2.5 left-[11px] size-[15px] text-[#8B8798]"
            aria-hidden="true"
          />
          <input
            id="node-search"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search nodes"
            className="w-full rounded-[9px] border border-line-strong bg-surface-sunken py-2 pr-3 pl-[34px] text-[13.5px] text-fg outline-none placeholder:text-fg-faint focus:border-violet-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        {sections.length === 0 ? (
          <p className="px-1 py-6 text-center text-[13px] text-fg-subtle">No nodes match.</p>
        ) : null}
        {sections.map((section, index) => (
          <div key={section.title}>
            <div
              className={cn(
                "px-1 pb-2 text-[11.5px] tracking-[0.1em] text-fg-faint uppercase",
                index === 0 ? "pt-2.5" : "pt-4",
              )}
            >
              {section.title}
            </div>
            <div className="flex flex-col gap-[5px]">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.type}
                    draggable
                    onDragStart={(event) => onDragStart(event, item.type)}
                    title={item.description}
                    className="flex cursor-grab items-center gap-2.5 rounded-md border border-line bg-surface px-[11px] py-2.5 transition-colors hover:border-violet-200 hover:bg-violet-50 active:cursor-grabbing"
                  >
                    <Icon
                      className={cn("size-4 shrink-0", CATEGORY_STYLE[item.category].icon)}
                      strokeWidth={1.9}
                      aria-hidden="true"
                    />
                    <span className="text-[13.5px] text-fg">{item.paletteLabel}</span>
                    {item.comingSoon ? (
                      <span className="ml-auto rounded-full bg-surface-hover px-2 py-px text-[10.5px] text-fg-subtle">
                        Soon
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p className="border-t border-line-soft px-4 py-3 text-xs leading-relaxed text-fg-subtle">
        Drag a node onto the canvas, then connect handles to set the run order.
      </p>
    </aside>
  );
}
