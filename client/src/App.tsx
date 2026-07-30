import { useState, useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import Landing from "@/pages/Landing";
import Login from "@/pages/authPages/Login";
import Register from "@/pages/authPages/Register";
import VerifyEmail from "@/pages/authPages/VerifyEmail";
import ForgotPassword from "@/pages/authPages/ForgotPassword";
import ResetPassword from "@/pages/authPages/ResetPassword";
import Dashboard from "@/pages/Dashboard";
import UploadResume from "@/pages/UploadResume";
import ResumeDetails from "@/pages/ResumeDetails";
import Profile from "@/pages/Profile";
import Billing from "@/pages/Billing";
import Subscription from "@/pages/Subscription";
import Credits from "@/pages/Credits";

import {
  AdminUsers,
  AdminUserDetails,
  AdminResumes,
  AdminPayments,
  AdminCreditsLedger,
  AdminAnalytics,
  AdminAuditLogs,
} from "@/pages/admin";

import ProtectedRoute from "@/routes/ProtectedRoute";
import PublicOnlyRoute from "@/routes/PublicOnlyRoute";
import ProtectedAdminRoute from "@/routes/ProtectedAdminRoute";
import { AppLayout } from "@/layouts/AppLayout";
import InsufficientCreditsModal from "@/components/modals/InsufficientCreditsModal";

import { Toaster } from "@/components/ui/sonner";

function App() {
  const [isCreditsModalOpen, setIsCreditsModalOpen] = useState(false);
  const [creditDetails, setCreditDetails] = useState<{ requiredCredits?: number; currentCredits?: number }>({});

  useEffect(() => {
    const handleInsufficientCredits = (e: Event) => {
      const customEv = e as CustomEvent;
      setCreditDetails({
        requiredCredits: customEv.detail?.requiredCredits,
        currentCredits: customEv.detail?.currentCredits,
      });
      setIsCreditsModalOpen(true);
    };

    window.addEventListener("credits:insufficient", handleInsufficientCredits);
    return () => {
      window.removeEventListener("credits:insufficient", handleInsufficientCredits);
    };
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/landing" element={<Landing />} />

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
            <Route path="/profile" element={<Profile />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/subscription" element={<Subscription />} />
            <Route path="/credits" element={<Credits />} />
            <Route path="/resumes/new" element={<UploadResume />} />
            <Route path="/analyze" element={<UploadResume />} />
            <Route path="/resumes/:id" element={<ResumeDetails />} />

            <Route element={<ProtectedAdminRoute />}>
              <Route path="/dashboard/users" element={<AdminUsers />} />
              <Route path="/dashboard/users/:id" element={<AdminUserDetails />} />
              <Route path="/dashboard/resumes-manage" element={<AdminResumes />} />
              <Route path="/dashboard/transactions" element={<AdminPayments />} />
              <Route path="/dashboard/credits-ledger" element={<AdminCreditsLedger />} />
              <Route path="/dashboard/analytics" element={<AdminAnalytics />} />
              <Route path="/dashboard/audit" element={<AdminAuditLogs />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <InsufficientCreditsModal
        isOpen={isCreditsModalOpen}
        onClose={() => setIsCreditsModalOpen(false)}
        requiredCredits={creditDetails.requiredCredits}
        currentCredits={creditDetails.currentCredits}
      />

      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;
