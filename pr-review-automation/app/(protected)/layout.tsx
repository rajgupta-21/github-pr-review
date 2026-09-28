import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { UserProvider } from "@/components/shell/user-context";
import { API_BASE } from "@/lib/api";
import type { MeResponse } from "@/lib/types";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    redirect("/login");
  }

  const response = await fetch(`${API_BASE}/auth/me`, {
    headers: { Cookie: `token=${token.value}` },
    cache: "no-store",
  }).catch(() => null);

  if (!response?.ok) {
    redirect("/login");
  }

  const { user } = (await response.json()) as MeResponse;

  // Each page picks its own shell (sidebar, rail or top bar) — see components/shell.
  return <UserProvider user={user}>{children}</UserProvider>;
}
