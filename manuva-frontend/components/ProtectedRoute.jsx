'use client';
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { assets } from "@/assets/assets";

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
        }
    }, [isAuthenticated, loading, router, pathname]);

    if (loading) {
        return (
            <div className="flex h-[60vh]items-center justify-center min-h-[50vh]">
                <Image src={assets.manuva_logo} width={100} height={100} alt="Loading" className="animate-pulse" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return children;
};

export default ProtectedRoute;
