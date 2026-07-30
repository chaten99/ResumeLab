import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  Sparkles,
  Zap,
  Check,
  ArrowRight,
  ShieldCheck,
  Target,
  BarChart3,
  Cpu,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { UserMenu } from "@/components/layout/UserMenu";

export const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { data: userResponse } = useCurrentUser();
  const user = userResponse?.user;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Header Navigation */}
      <header className="border-b bg-card/80 backdrop-blur-xs sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-6xl">
          <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight text-foreground hover:opacity-90 transition-opacity">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
              <FileText className="size-4" />
            </div>
            <span className="text-base font-extrabold">ResumeLab</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <Button size="sm" onClick={() => navigate("/dashboard")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
                  <LayoutDashboard className="size-3.5" /> Dashboard
                </Button>
                <UserMenu />
              </>
            ) : (
              <>
                <Button size="sm" variant="ghost" onClick={() => navigate("/login")} className="text-xs font-semibold h-9">
                  Sign In
                </Button>
                <Button size="sm" onClick={() => navigate("/register")} className="text-xs font-semibold h-9 gap-1.5 shadow-xs">
                  Get Started <ArrowRight className="size-3.5" />
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-28 container mx-auto px-4 max-w-5xl text-center space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-4 max-w-3xl mx-auto"
        >
          <Badge variant="outline" className="text-[11px] uppercase font-bold tracking-widest text-primary border-primary/30 px-3 py-1 bg-primary/5">
            <Sparkles className="size-3 mr-1 text-primary inline" /> Powered by Gemini 2.5 AI Engine
          </Badge>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
            Build Resumes that Win High-Paying Tech Roles.
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto font-normal leading-relaxed">
            AI-driven ATS keyword optimization, real-time recruiter scoring, and bullet point enhancement tailored for engineering and tech leaders.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Button size="lg" onClick={() => navigate(user ? "/dashboard" : "/register")} className="text-sm font-bold h-11 px-8 gap-2 shadow-md w-full sm:w-auto">
            {user ? "Go to Dashboard" : "Upload & Analyze Free"} <ArrowRight className="size-4" />
          </Button>
          {!user && (
            <Button size="lg" variant="outline" onClick={() => navigate("/login")} className="text-sm font-bold h-11 px-8 w-full sm:w-auto">
              Live Demo
            </Button>
          )}
        </motion.div>

        {/* Feature Badges */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium border-t border-border/60 max-w-2xl mx-auto">
          <span className="flex items-center gap-1.5"><ShieldCheck className="size-4 text-emerald-500" /> 100% ATS Compliant</span>
          <span className="flex items-center gap-1.5"><Zap className="size-4 text-amber-500 fill-amber-500" /> Instant 10 Free Credits</span>
          <span className="flex items-center gap-1.5"><Target className="size-4 text-primary" /> Role-Targeted Feedback</span>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/30 border-y border-border">
        <div className="container mx-auto px-4 max-w-6xl space-y-12">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground">Everything you need to bypass ATS filters</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">Engineered for perfection with state-of-the-art LLM analysis.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <BarChart3 className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Deep ATS Scoring</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Scan your resume against job descriptions to discover missing keywords and formatting bottlenecks before recruiters do.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Sparkles className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Bullet Improver</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Transform weak bullet points into high-impact metric-driven statements using proven XYZ impact formulas.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6 shadow-2xs space-y-3">
              <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Cpu className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Recruiter Perspective</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Receive simulated feedback from senior engineering managers inspecting leadership, technical depth, and project execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 container mx-auto px-4 max-w-5xl space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-widest text-primary border-primary/30 px-3 py-1">
            Simple Pricing
          </Badge>
          <h2 className="text-3xl font-extrabold text-foreground">Pay as you grow with credit packs</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* FREE */}
          <div className="rounded-2xl border bg-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold">FREE</h3>
              <div className="text-3xl font-extrabold">₹0</div>
              <p className="text-xs text-muted-foreground">10 Credits included upon email verification.</p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Resume Upload &amp; Parsing</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Basic AI Analysis</li>
              </ul>
            </div>
            <Button variant="outline" onClick={() => navigate(user ? "/dashboard" : "/register")} className="w-full text-xs font-bold h-10">
              {user ? "View Dashboard" : "Get Started"}
            </Button>
          </div>

          {/* PRO */}
          <div className="rounded-2xl border-2 border-primary bg-card p-6 flex flex-col justify-between space-y-6 relative shadow-md">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] uppercase font-extrabold px-3 py-0.5 rounded-full">Most Popular</div>
            <div className="space-y-3">
              <h3 className="text-lg font-bold">PRO</h3>
              <div className="text-3xl font-extrabold">₹199 <span className="text-xs text-muted-foreground font-normal">/mo</span></div>
              <p className="text-xs text-muted-foreground">250 Monthly Credits for active job seekers.</p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> 250 Monthly Credits</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Priority AI Engine</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> ATS Keyword Matcher</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Bullet Improver</li>
              </ul>
            </div>
            <Button onClick={() => navigate(user ? "/subscription" : "/register")} className="w-full text-xs font-bold h-10">
              {user ? "Upgrade to Pro" : "Upgrade to Pro"}
            </Button>
          </div>

          {/* PREMIUM */}
          <div className="rounded-2xl border bg-card p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <h3 className="text-lg font-bold">PREMIUM</h3>
              <div className="text-3xl font-extrabold">₹499 <span className="text-xs text-muted-foreground font-normal">/mo</span></div>
              <p className="text-xs text-muted-foreground">1000 Monthly Credits for power applicants.</p>
              <ul className="space-y-2 text-xs text-muted-foreground pt-2">
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> 1000 Monthly Credits</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Unlimited Diagnostics</li>
                <li className="flex items-center gap-2"><Check className="size-4 text-emerald-500" /> Priority Support</li>
              </ul>
            </div>
            <Button variant="outline" onClick={() => navigate(user ? "/subscription" : "/register")} className="w-full text-xs font-bold h-10">
              {user ? "Get Premium" : "Get Premium"}
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card/60 py-8 text-center text-xs text-muted-foreground">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} ResumeLab Inc. All rights reserved.</span>
          <div className="flex items-center gap-4">
            {user ? (
              <Link to="/dashboard" className="hover:text-foreground">Dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="hover:text-foreground">Sign In</Link>
                <Link to="/register" className="hover:text-foreground">Register</Link>
              </>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
