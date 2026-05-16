"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { Spinner } from "@/components/ui/spinner";

interface RouteGuardProps {
  children: React.ReactNode;
  type: "protected" | "public";
}

export function RouteGuard({ children, type }: RouteGuardProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (type === "protected" && !isAuthenticated) {
      router.push("/login");
    } else if (type === "public" && isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, loading, router, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (type === "protected" && !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="size-8 text-primary" />
      </div>
    );
  }

  if (type === "public" && isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}
