"use client";

import { ChevronDown, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/lib/api";
import { cn } from "@/lib/utils";

import { displayName, useUser } from "./user-context";

/** Avatar + name + plan, with a menu that signs out. */
export function AccountMenu({ compact = false }: { compact?: boolean }) {
  const user = useUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const name = displayName(user);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await logout();
    } catch (error) {
      console.error(error);
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={compact ? `Account menu for ${name}` : "Account menu"}
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-md text-left",
          compact ? "justify-center p-0" : "p-0",
        )}
      >
        <Avatar name={name} src={user?.githubAvatarUrl} tone="ink" size={compact ? 32 : 34} />
        {compact ? null : (
          <>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-semibold text-ink-fg">{name}</span>
              <span className="block text-xs text-[#7E7A9E]">{user?.plan || "Free"} plan</span>
            </span>
            <ChevronDown className="size-4 text-[#7E7A9E]" aria-hidden="true" />
          </>
        )}
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute z-50 min-w-48 rounded-[12px] border border-line bg-surface p-1.5 shadow-[0_12px_40px_rgba(20,18,42,0.18)]",
            compact ? "bottom-0 left-full ml-3" : "right-0 bottom-full mb-2",
          )}
        >
          <div className="border-b border-line-soft px-3 pt-1.5 pb-2.5">
            <div className="truncate text-[13.5px] font-semibold text-fg">{name}</div>
            {user?.email ? (
              <div className="truncate text-xs text-fg-subtle">{user.email}</div>
            ) : null}
          </div>
          <button
            role="menuitem"
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="mt-1 flex w-full items-center gap-2.5 rounded-sm px-3 py-2.5 text-left text-sm text-fg-2 hover:bg-surface-hover"
          >
            <LogOut className="size-4 text-fg-subtle" aria-hidden="true" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
