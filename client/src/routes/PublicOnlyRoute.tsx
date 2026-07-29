import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { FullPageLoader } from "@/components/ui/loader";

const PublicOnlyRoute = () => {
    const { data, isLoading } = useCurrentUser();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <FullPageLoader subtitle="Loading application..." />
            </div>
        );
    }

    if (data?.user) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default PublicOnlyRoute;