import { Navigate, Route, Routes } from "react-router-dom";

import Login from "@/pages/authPages/Login";
import Register from "@/pages/authPages/Register";
import VerifyEmail from "@/pages/authPages/VerifyEmail";
import ForgotPassword from "@/pages/authPages/ForgotPassword";
import ResetPassword from "@/pages/authPages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import UploadResume from "@/pages/UploadResume";
import ResumeDetails from "@/pages/ResumeDetails";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";
import { AppLayout } from "@/layouts/AppLayout";

import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Publicly accessible standalone routes (without auth guards) */}
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/verify-email/" element={<VerifyEmail />} />

        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes/new" element={<UploadResume />} />
            <Route path="/analyze" element={<UploadResume />} />
            <Route path="/resumes/:id" element={<ResumeDetails />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
