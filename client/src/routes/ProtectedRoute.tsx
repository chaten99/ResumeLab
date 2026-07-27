import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";

const ProtectedRoute = () => {
    const { data, isLoading } = useCurrentUser();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <p>Loading...</p>
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