import { RouteGuard } from "@/features/auth/components/RouteGuard";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <RouteGuard type="public">
            <div className="w-full min-h-screen bg-amber-400 p-3 pl-16 pr-0">
                <div className="w-full h-full min-h-[calc(100vh-1.5rem)] bg-background rounded-l-2xl">
                    {children}
                </div>
            </div>
        </RouteGuard>
    );
}