import { Navigate, Route, Routes } from "react-router-dom";

import Login from "@/pages/authPages/Login";
import Register from "@/pages/authPages/Register";
import VerifyEmail from "@/pages/authPages/VerifyEmail";
import ForgotPassword from "@/pages/authPages/ForgotPassword";
import ResetPassword from "@/pages/authPages/ResetPassword";
import Dashboard from "@/pages/Dashboard";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
