import { BookMarked, LayoutDashboard, Workflow } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  /** extra path prefixes that also mark this item active */
  match?: string[];
};

/*
  Only screens that exist. The design also shows Pull requests, Usage and
  Settings — those have no backing routes yet (see status/not-done.md).
*/
export const WORKSPACE_NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/repos", label: "Repositories", icon: BookMarked },
  { href: "/workflow", label: "Workflows", icon: Workflow },
];

export function isActive(pathname: string, item: NavItem) {
  const prefixes = [item.href, ...(item.match ?? [])];
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}
