import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AuthLayout from "@/layouts/AuthLayout";

import {
  forgotPasswordSchema,
  type ForgotPasswordFormData,
} from "@/features/auth/schemas/auth.schema";

import { useForgotPassword } from "@/features/auth/hooks/useAuth";
import { authFlowStorage } from "@/features/auth/utils/authFlowStorage";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const forgotPasswordMutation = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors, isValid, isSubmitted },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      await forgotPasswordMutation.mutateAsync(data);
      authFlowStorage.setResetEmail(data.email);

      toast.success(
        "If an account exists with this email, a password reset code has been sent.",
      );

      navigate("/reset-password", {
        replace: true,
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            "Unable to process your request.",
        );
        return;
      }
      toast.error("Something went wrong.");
    }
  };

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a password reset code."
      showBackToLogin={true}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs font-medium text-destructive">{errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full mt-2"
          disabled={forgotPasswordMutation.isPending || (isSubmitted && !isValid)}
        >
          {forgotPasswordMutation.isPending
            ? "Sending reset code..."
            : "Send reset code"}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
