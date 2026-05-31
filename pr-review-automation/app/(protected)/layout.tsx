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
  const data = await response.json();
  console.log("reponse from something url", data);
  return (
    <div
      className="min-h-screen bg-white text-black font-mono flex
    "
    >
      {/*Implementation of Sidebar pending*/}
      <SidebarForMain />
      <div className="p-10 flex ">{children}</div>
    </div>
  );
}
