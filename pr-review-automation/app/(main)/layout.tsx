export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen bg-white text-black
    "
    >
      <div className="rounded-lg">{children}</div>
    </div>
  );
}
