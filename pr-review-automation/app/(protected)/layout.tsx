import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SidebarForMain from "../components/sidebar";
export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token");
  if (!token) {
    redirect("/login");
  }

  const response = await fetch("http://localhost:4000/auth/me", {
    method: "GET",
    headers: {
      Cookie: `token=${token.value}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-white text-black font-mono flex flex-col lg:flex-row">
      <SidebarForMain />
      <div className="flex p-4 w-full lg:p-10">{children}</div>
    </div>
  );
}
