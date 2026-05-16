import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard type="public">
      <div className="w-full min-h-screen flex bg-primary">
        <div className="w-full bg-primary flex-1 hidden md:block"></div>
        <div className="md:p-2 flex-1 min-h-full">
          <div className="w-full bg-background h-full">{children}</div>
        </div>
      </div>
    </RouteGuard>
  );
}
