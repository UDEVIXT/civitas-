import Image from "next/image";
import { RouteGuard } from "@/features/auth/components/RouteGuard";
import udevLogo from "@/assets/images/svg/udev-logo.svg";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RouteGuard type="public">
      <div className="w-full min-h-screen flex bg-primary">
        <div className="w-full bg-primary flex-1 hidden md:flex flex-col items-center justify-center gap-2">
          <Image
            src={udevLogo}
            alt="UDEV Logo"
            className="w-96 h-auto"
            priority
          />
          <p className="text-foreground text-lg font-semibold">
            Bienvenido a tu hogar
          </p>
        </div>
        <div className="md:p-2 flex-1 min-h-full">
          <div className="w-full bg-background h-full">{children}</div>
        </div>
      </div>
    </RouteGuard>
  );
}
