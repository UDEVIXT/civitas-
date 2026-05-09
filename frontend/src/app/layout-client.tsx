"use client";

import { Toaster } from "@/components/ui/toaster";

type RootLayoutClientProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
