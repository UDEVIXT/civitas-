"use client";

import { useEffect, useRef } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as ToasterProvider } from "sonner";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useSocket } from "@/features/auth/hooks/useSocket";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const checkAuth = useAuth((state) => state.checkAuth);
  const user = useAuth((state) => state.user);
  const previousUserKey = useRef<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const nextUserKey = user ? `${user.id}:${user.rol}` : "anonymous";

    if (previousUserKey.current !== null && previousUserKey.current !== nextUserKey) {
      queryClient.clear();
    }

    previousUserKey.current = nextUserKey;
  }, [user?.id, user?.rol]);

  return <>{children}</>;
}

function SocketInitializer() {
  useSocket();
  return null;
}

type RootLayoutClientProps = Readonly<{
  children: React.ReactNode;
}>;

export default function RootLayoutClient({ children }: RootLayoutClientProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
        <SocketInitializer />
      </AuthInitializer>
      <Toaster />
      <ToasterProvider richColors />
    </QueryClientProvider>
  );
}
