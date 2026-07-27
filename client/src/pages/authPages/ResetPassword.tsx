import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/AuthLayout";
import { authFlowStorage } from "@/features/auth/utils/authFlowStorage";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { PasswordRequirements } from "@/features/auth/components/PasswordRequirements";

import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/features/auth/schemas/auth.schema";

import { useResetPassword } from "@/features/auth/hooks/useAuth";

const ResetPassword = () => {
  const navigate = useNavigate();
  const resetMutation = useResetPassword();
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const email = authFlowStorage.getResetEmail();

  const {
    control,
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors, isValid, isSubmitted },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const otpValue = watch("otp") || "";
  const newPasswordValue = watch("newPassword") || "";
  const confirmPasswordValue = watch("confirmPassword") || "";
  const isPasswordValid =
    newPasswordValue.length >= 8 &&
    /[A-Z]/.test(newPasswordValue) &&
    /[^a-zA-Z0-9]/.test(newPasswordValue);

  const isPasswordMatching =
    confirmPasswordValue.length > 0 && confirmPasswordValue === newPasswordValue;

  useEffect(() => {
    if (confirmPasswordValue) {
      trigger("confirmPassword");
    }
  }, [newPasswordValue, confirmPasswordValue, trigger]);

  if (!email) {
    return <Navigate to="/forgot-password" replace />;
  }

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetMutation.mutateAsync({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });

      authFlowStorage.clearResetEmail();
      toast.success(
        "Password reset successfully. Please sign in with your new password.",
      );

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message || "Unable to reset password.",
        );
        return;
      }
      toast.error("Something went wrong.");
    }
  };

  return (
    <AuthLayout
      title="Reset your password"
      subtitle={`Enter the code sent to ${email}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center justify-between w-full">
            <Label className="self-start">Reset Code</Label>
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

        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              placeholder="Create a strong password"
              autoComplete="new-password"
              className="pr-10"
              aria-invalid={!!errors.newPassword}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showNewPassword ? "Hide password" : "Show password"}
            >
              {showNewPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>

          <PasswordRequirements password={newPasswordValue} />

          {errors.newPassword && !newPasswordValue && (
            <p className="text-xs font-medium text-destructive">
              {errors.newPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              autoComplete="new-password"
              className="pr-10"
              aria-invalid={!!errors.confirmPassword}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          {confirmPasswordValue.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs mt-1">
              {isPasswordMatching && isPasswordValid ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <X className="size-3.5 text-destructive" />
              )}
              <span
                className={
                  isPasswordMatching && isPasswordValid
                    ? "text-emerald-600 font-medium dark:text-emerald-400"
                    : "text-destructive font-medium"
                }
              >
                {isPasswordMatching ? "Passwords match" : "Passwords do not match"}
              </span>
            </div>
          )}
          {errors.confirmPassword && !confirmPasswordValue && (
            <p className="text-xs font-medium text-destructive">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={resetMutation.isPending || (isSubmitted && !isValid)}
        >
          {resetMutation.isPending ? "Resetting..." : "Reset password"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
