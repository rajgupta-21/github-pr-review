"use client";

import { createContext, useContext } from "react";

import type { User } from "@/lib/types";

const UserContext = createContext<User | null>(null);

/** Provided by the (protected) layout, which has already verified the session. */
export function UserProvider({ user, children }: { user: User; children: React.ReactNode }) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}

export function displayName(user: User | null) {
  return user?.githubUsername || user?.name || user?.email?.split("@")[0] || "there";
}
