"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRoutes } from "@/hooks/useRoutes";
import { Home } from "lucide-react";
import Image from "next/image";
import logoUdev from "@/assets/images/png/logoUdev.png";

function NavItem({ href, active, label, showLabel, children }) {
  return (
    <Link href={href} title={label} className="w-full">
      <div
        className={`flex items-center rounded-xl transition-all duration-150 ${
          showLabel ? "gap-3 px-3 py-2" : "justify-center w-10 h-10 mx-auto"
        } ${
          active
            ? "bg-[#EBA00C] text-black"
            : "text-[#2B2B2B] hover:text-black hover:bg-white/15"
        }`}
      >
        {children}
        {showLabel && <span className="text-sm font-medium truncate">{label}</span>}
      </div>
    </Link>
  );
}

export function Sidebar({ showLabel = false }) {
  const pathname = usePathname();
  const { allowedRoutes } = useRoutes();

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  return (
    <nav className="flex flex-col items-center gap-3 h-full pt-2">
      <div className="mb-6 flex items-center justify-center">
        <Image src={logoUdev} alt="Logo" width={29} height={29} className="object-contain" />
      </div>

      <NavItem href="/" active={pathname === "/"} label="Inicio" showLabel={showLabel}>
        <Home className="w-5 h-5 shrink-0" />
      </NavItem>

      {allowedRoutes.map((route) => {
        const Icon = route.icon;
        return (
          <NavItem
            key={route.path}
            href={route.path}
            active={isActive(route.path)}
            label={route.label}
            showLabel={showLabel}
          >
            <Icon className="w-5 h-5 shrink-0" />
          </NavItem>
        );
      })}
    </nav>
  );
}
