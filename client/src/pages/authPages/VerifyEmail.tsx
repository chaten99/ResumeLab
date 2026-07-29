// TEMPORARY DEVELOPER TOOL
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { toast } from "sonner";
import { Wrench } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import AuthLayout from "@/layouts/AuthLayout";
import { authFlowStorage } from "@/features/auth/utils/authFlowStorage";
import { devBypassVerifyEmail } from "@/features/auth/api/auth.api";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import {
  verifyEmailSchema,
  type VerifyEmailFormData,
} from "@/features/auth/schemas/auth.schema";

import {
  useResendVerification,
  useVerifyEmail,
} from "@/features/auth/hooks/useAuth";

// TEMPORARY DEVELOPER TOOL SCHEMA
const devToolSchema = z.object({
  email: z
    .string()
    .min(1, "Email field cannot be empty.")
    .email("Please enter a valid email."),
  secret: z.string().min(1, "Developer secret is required."),
});

type DevToolFormData = z.infer<typeof devToolSchema>;

const VerifyEmail = () => {
  const navigate = useNavigate();

  const verifyMutation = useVerifyEmail();
  const resendMutation = useResendVerification();

  const [countdown, setCountdown] = useState<number>(0);

  const storedEmail = authFlowStorage.getVerificationEmail();
  const [manualEmail, setManualEmail] = useState<string>(storedEmail || "");

  const activeEmail = manualEmail.trim() || storedEmail || "";

  // TEMPORARY DEVELOPER TOOL STATE
  const [isDevDialogOpen, setIsDevDialogOpen] = useState<boolean>(false);
  const [isDevSubmitting, setIsDevSubmitting] = useState<boolean>(false);

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

  // TEMPORARY DEVELOPER TOOL FORM
  const {
    register: registerDev,
    handleSubmit: handleDevSubmit,
    reset: resetDevForm,
    setValue: setDevValue,
    formState: { errors: devErrors },
  } = useForm<DevToolFormData>({
    resolver: zodResolver(devToolSchema),
    defaultValues: {
      email: activeEmail || "",
      secret: "",
    },
  });

  useEffect(() => {
    if (activeEmail) {
      setDevValue("email", activeEmail);
    }
  }, [activeEmail, setDevValue]);

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

  // TEMPORARY DEVELOPER TOOL HANDLER
  const onDevBypassSubmit = async (data: DevToolFormData) => {
    setIsDevSubmitting(true);
    try {
      const response = await devBypassVerifyEmail(
        data.email.trim(),
        data.secret.trim(),
      );
      toast.success(response.message || "Email verified successfully.");
      setIsDevDialogOpen(false);
      resetDevForm();
      authFlowStorage.clearVerificationEmail();
      navigate("/login", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Developer verification failed.",
        );
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsDevSubmitting(false);
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

      {/* TEMPORARY DEVELOPER TOOL */}
      <div className="mt-8 pt-4 border-t border-border/40 text-center text-xs text-muted-foreground">
        <span>Need developer access? </span>
        <Dialog open={isDevDialogOpen} onOpenChange={setIsDevDialogOpen}>
          <DialogTrigger
            render={
              <Button
                variant="link"
                className="h-auto p-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Developer Verification
              </Button>
            }
          />
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-base font-semibold">
                <Wrench className="size-4 text-amber-500" />
                <span>Developer Verification</span>
              </DialogTitle>
              <DialogDescription className="text-xs">
                Bypass email OTP verification for testing accounts during development.
              </DialogDescription>
            </DialogHeader>

            <form
              onSubmit={handleDevSubmit(onDevBypassSubmit)}
              className="space-y-4 py-2"
            >
              <div className="space-y-1.5 text-left">
                <Label htmlFor="dev-email" className="text-xs">
                  Email
                </Label>
                <Input
                  id="dev-email"
                  type="email"
                  placeholder="user@example.com"
                  {...registerDev("email")}
                  className="text-xs h-9 font-mono"
                />
                {devErrors.email && (
                  <p className="text-xs font-medium text-destructive">
                    {devErrors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-left">
                <Label htmlFor="dev-secret" className="text-xs">
                  Secret Code
                </Label>
                <Input
                  id="dev-secret"
                  type="password"
                  placeholder="Enter developer secret"
                  {...registerDev("secret")}
                  className="text-xs h-9 font-mono"
                />
                {devErrors.secret && (
                  <p className="text-xs font-medium text-destructive">
                    {devErrors.secret.message}
                  </p>
                )}
              </div>

              <DialogFooter className="mt-6 gap-2 sm:gap-0">
                <DialogClose
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      disabled={isDevSubmitting}
                    >
                      Cancel
                    </Button>
                  }
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isDevSubmitting}
                  className="text-xs font-medium"
                >
                  {isDevSubmitting ? "Verifying..." : "Verify"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AuthLayout>
  );
};

export default VerifyEmail;
