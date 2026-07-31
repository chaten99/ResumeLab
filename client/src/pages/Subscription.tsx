import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Check, Sparkles, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PageTransition } from "@/components/layout/PageTransition";
import {
  useCurrentSubscription,
  useStartCheckout,
  useVerifySession,
} from "@/features/subscription/hooks/useSubscription";

export const Subscription: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { data: subData, isLoading } = useCurrentSubscription();
  const checkoutMutation = useStartCheckout();
  const verifySessionMutation = useVerifySession();

  useEffect(() => {
    const isSuccess = searchParams.get("success") === "true";
    const sessionId = searchParams.get("session_id");

    if (isSuccess && sessionId) {
      toast.loading("Verifying subscription status...");
      verifySessionMutation
        .mutateAsync(sessionId)
        .then((res) => {
          toast.dismiss();
          queryClient.invalidateQueries({ queryKey: ["auth"] });
          queryClient.invalidateQueries({ queryKey: ["subscription", "status"] });
          queryClient.invalidateQueries({ queryKey: ["billing", "history"] });
          queryClient.invalidateQueries({ queryKey: ["user", "credits"] });
          toast.success("Subscription Activated!", {
            description: `Successfully upgraded to ${res.plan} plan with ${res.credits} credits.`,
          });
          setSearchParams({}, { replace: true });
        })
        .catch((err: any) => {
          toast.dismiss();
          toast.error("Session verification failed", {
            description: err?.response?.data?.message || "Please contact support.",
          });
          setSearchParams({}, { replace: true });
        });
    } else if (searchParams.get("canceled") === "true") {
      toast.info("Checkout Canceled", {
        description: "Your active plan remains unchanged.",
      });
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams, queryClient]);

  const currentPlan = subData?.subscription?.plan || "FREE";
  const plans = subData?.plans || [
    {
      id: "FREE",
      name: "FREE",
      price: 0,
      credits: 10,
      features: ["10 Initial Credits included", "Resume Upload & Parsing", "Basic Dashboard"],
    },
    {
      id: "PRO",
      name: "PRO",
      price: 199,
      credits: 250,
      features: ["250 Monthly Credits", "Priority AI Engine", "ATS Keyword Matcher", "Bullet Improvement Engine"],
    },
    {
      id: "PREMIUM",
      name: "PREMIUM",
      price: 499,
      credits: 1000,
      features: ["1000 Monthly Credits", "Everything in Pro", "Unlimited Project Diagnostics", "Priority Support"],
    },
  ];

  const handleCheckout = async (planId: "PRO" | "PREMIUM") => {
    try {
      toast.loading("Initiating Stripe Checkout...");
      const res = await checkoutMutation.mutateAsync(planId);
      toast.dismiss();
      if (res?.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        toast.error("Stripe checkout URL not received.");
      }
    } catch (err: any) {
      toast.dismiss();
      toast.error(err?.response?.data?.message || "Failed to start checkout session");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-5xl space-y-8 font-sans">
        <Skeleton className="h-10 w-64 mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition className="container mx-auto px-4 py-12 max-w-5xl space-y-10 font-sans">
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/30 px-3 py-1">
          Flexible Pricing
        </Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
          Accelerate your career with AI Credits
        </h1>
        <p className="text-sm text-muted-foreground">
          Upgrade your plan for priority ATS keyword matching, deep recruiter feedback, and continuous resume optimization.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {plans.map((p: any) => {
          const isCurrent = currentPlan === p.id;
          const isPopular = p.id === "PRO";

          // UI BUY RULES (FREE / PRO / PREMIUM)
          const isProPlan = p.id === "PRO";
          const isPremiumPlan = p.id === "PREMIUM";

          let isButtonDisabled = false;
          let buttonLabel = `Upgrade to ${p.name}`;

          if (currentPlan === "FREE") {
            if (p.id === "FREE") {
              isButtonDisabled = true;
              buttonLabel = "Active Plan";
            }
          } else if (currentPlan === "PRO") {
            if (isProPlan || p.id === "FREE") {
              isButtonDisabled = true;
              buttonLabel = isProPlan ? "Current Plan" : "Included";
            } else if (isPremiumPlan) {
              buttonLabel = "Upgrade to PREMIUM";
            }
          } else if (currentPlan === "PREMIUM") {
            isButtonDisabled = true;
            if (isPremiumPlan) {
              buttonLabel = "Current Active Plan";
            } else {
              buttonLabel = "Downgrade Unavailable";
            }
          }

          return (
            <div
              key={p.id}
              className={`rounded-2xl border bg-card p-6 shadow-2xs flex flex-col justify-between relative transition-all ${
                isPopular && currentPlan !== "PREMIUM" ? "border-primary shadow-md ring-1 ring-primary/20 scale-102" : "border-border"
              }`}
            >
              {isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-extrabold px-3 py-0.5 rounded-full tracking-wider shadow-xs">
                  Most Popular
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">{p.name}</h2>
                  {isCurrent && (
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px]">
                      Current Plan
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">₹{p.price}</span>
                  <span className="text-xs text-muted-foreground font-medium">/ month</span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold w-fit">
                  <Zap className="size-3.5 fill-amber-500 text-amber-500" />
                  <span>{p.credits} Monthly Credits</span>
                </div>

                <ul className="space-y-2.5 pt-2 text-xs text-muted-foreground">
                  {p.features?.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <Check className="size-4 text-emerald-500 shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-6 mt-6 border-t border-border">
                {isButtonDisabled ? (
                  <Button variant="outline" disabled className="w-full text-xs font-bold h-10">
                    {buttonLabel}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleCheckout(p.id)}
                    disabled={checkoutMutation.isPending}
                    className="w-full text-xs font-bold h-10 gap-1.5 shadow-xs"
                  >
                    <Sparkles className="size-4" />
                    <span>{buttonLabel}</span>
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageTransition>
  );
};

export default Subscription;
