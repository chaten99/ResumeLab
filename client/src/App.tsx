import { Navigate, Route, Routes } from "react-router-dom";

import Login from "@/pages/Login";
import Register from "@/pages/Register";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";

import { Toaster } from "@/components/ui/sonner";

function App() {
    return (
        <>
            <Routes>
                <Route
                    path="/"
                    element={<div>ResumeLab</div>}
                />

                <Route element={<PublicOnlyRoute />}>
                    <Route
                        path="/login"
                        element={<Login />}
                    />

                    <Route
                        path="/register"
                        element={<Register />}
                    />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/dashboard"
                        element={<div>Dashboard</div>}
                    />
                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />
            </Routes>

            <Toaster richColors position="top-right" />
        </>
    );
}

export default App;