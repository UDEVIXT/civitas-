"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import { useAuth } from "./useAuth";

function getSocketUrl(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.REACT_APP_API_URL ||
    "http://localhost:3001/api/";
  try {
    const url = new URL(apiUrl);
    return url.origin;
  } catch {
    return "http://localhost:3001";
  }
}

export function useSocket() {
  const socketRef = useRef<Socket | null>(null);
  const user = useAuth((s) => s.user);
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const url = getSocketUrl();
    const socket: Socket = io(url, { withCredentials: true });
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("register", user.id);
    });

    socket.on("new-login-detected", (payload: { message: string }) => {
      toast.warning(payload.message, {
        duration: 10000,
        action: {
          label: "Cerrar sesión",
          onClick: () => useAuth.getState().logout(),
        },
      });
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated, user]);

  return socketRef;
}
