import { Navigation } from "../components/Navigation";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-screen h-screen bg-blue-50 font-mono">
      <div className="h-screen mx-32  text-black">
        <Navigation />
        <div className="">{children}</div>
      </div>
    </div>
  );
}
