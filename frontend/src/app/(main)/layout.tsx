import { LayoutWrapper } from "@/components/layout/LayoutWrapper";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-full flex flex-col">
      <LayoutWrapper>{children}</LayoutWrapper>
    </div>
  );
}
