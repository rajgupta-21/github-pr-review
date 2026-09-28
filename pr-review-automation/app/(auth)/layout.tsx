import { BrandPanel } from "./_components/brand-panel";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-paper">
      <BrandPanel />
      {children}
    </div>
  );
}
