import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/layouts/AuthLayout";
import { authFlowStorage } from "@/features/auth/utils/authFlowStorage";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from "@/features/auth/schemas/auth.schema";

import {
  useResendVerification,
  useVerifyEmail,
} from "@/features/auth/hooks/useAuth";

const VerifyEmail = () => {
  const navigate = useNavigate();

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [countdown, setCountdown] = useState<number>(0);

  const storedEmail = authFlowStorage.getVerificationEmail();
  const [manualEmail, setManualEmail] = useState<string>(storedEmail || "");

  const activeEmail = manualEmail.trim() || storedEmail || "";

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid, isSubmitted },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
    },
  });

  const otpValue = watch("otp") || "";

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const onSubmit = async (data: VerifyEmailFormData) => {
    if (!activeEmail) {
      toast.error("Please enter your email address.");
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        email: activeEmail,
        otp: data.otp,
      });

      authFlowStorage.clearVerificationEmail();
      toast.success("Email verified successfully!");
      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Unable to verify email.");
        return;
      }
      toast.error("Something went wrong.");
    }
  };

  const handleResend = async () => {
    if (!activeEmail || countdown > 0 || resendMutation.isPending) {
      if (!activeEmail) toast.error("Please enter your email address first.");
      return;
    }

    try {
      await resendMutation.mutateAsync({
        email: activeEmail,
      });

      toast.success("A new verification code has been sent.");
      setCountdown(60);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Unable to resend verification code.",
        );
        return;
      }
      toast.error("Something went wrong.");
    }
  };

  return (
    <AuthLayout
      title="Verify your email"
      subtitle={
        activeEmail
          ? `We sent a 6-digit verification code to ${activeEmail}`
          : "Enter your email and verification code to continue"
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!storedEmail && (
          <div className="space-y-1.5 text-left">
            <Label className="text-xs">Email Address</Label>
            <Input
              type="email"
              placeholder="user@example.com"
              value={manualEmail}
              onChange={(e) => setManualEmail(e.target.value)}
              className="text-xs"
            />
          </div>
        )}

        <div className="flex flex-col items-center space-y-3">
          <div className="flex items-center justify-between w-full">
            <Label className="self-start">Verification Code</Label>
            <span className="text-[11px] text-muted-foreground font-medium">
              {otpValue.length}/6 digits
            </span>
          </div>
          <Controller
            control={control}
            name="otp"
            render={({ field }) => (
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
              >
                <InputOTPGroup aria-invalid={!!errors.otp}>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            )}
          />
          {errors.otp && (
            <p className="text-xs font-medium text-destructive">{errors.otp.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={verifyMutation.isPending || (isSubmitted && !isValid)}
        >
          {verifyMutation.isPending ? "Verifying..." : "Verify email"}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Didn't receive the code?
        </p>

        <Button
          type="button"
          variant="link"
          className="h-auto p-0 mt-1 text-xs font-medium"
          disabled={!activeEmail || countdown > 0 || resendMutation.isPending}
          onClick={handleResend}
        >
          {resendMutation.isPending
            ? "Sending..."
            : countdown > 0
              ? `Resend in ${countdown}s`
              : "Resend code"}
        </Button>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
