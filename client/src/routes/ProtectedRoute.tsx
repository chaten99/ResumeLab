import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { FullPageLoader } from "@/components/ui/loader";

const ProtectedRoute = () => {
    const { data, isLoading } = useCurrentUser();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <FullPageLoader subtitle="Loading application..." />
            </div>
        );
    }

    if (!data?.user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;