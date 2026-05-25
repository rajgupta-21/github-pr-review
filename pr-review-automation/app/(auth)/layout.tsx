export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-black">
      <div className="rounded-lg">{children}</div>
    </div>
  );
}
