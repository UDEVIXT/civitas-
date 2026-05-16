import { LayoutWrapper } from "@/components/layout/LayoutWrapper";
import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard type="protected">
      <div className="min-h-full flex flex-col">
        <LayoutWrapper>{children}</LayoutWrapper>
      </div>
    </RouteGuard>
  );
}
