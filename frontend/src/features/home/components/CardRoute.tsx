"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import type { Route } from "../data/routes";

interface CardRouteProps {
  route: Route;
}

export function CardRoute({ route }: CardRouteProps) {
  const Icon = route.icon;

  return (
    <Link href={route.path} className="block h-full">
      <Card className="h-full cursor-pointer transition-all hover:ring-2 hover:ring-primary/50 hover:shadow-md">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <Icon className="size-5 text-primary" />
            </div>
            <CardTitle>{route.label}</CardTitle>
          </div>
          <CardDescription>{route.description}</CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}
