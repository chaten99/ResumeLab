import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export const ProtectedAdminRoute: React.FC = () => {
  const { data: userResponse, isLoading } = useCurrentUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Skeleton className="h-12 w-64 rounded-xl" />
      </div>
    );
  }

  const user = userResponse?.user;

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;
