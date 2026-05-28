import { Navigation } from "../components/Navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen min-h-screen bg-blue-50 font-mono">
      <div className="min-h-screen mx-4 lg:mx-32 text-black flex flex-col">
        <Navigation />

        <div className="w-full h-px bg-gray-300" />

        <div className="flex-1 p-2 bg-white/30 mt-4 ">{children}</div>
      </div>
    </div>
  );
}
