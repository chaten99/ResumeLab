import React from "react";
import { TrendingUp, Award, Target, AlertCircle, CheckCircle2 } from "lucide-react";
import type { AchievementImpact } from "../../types/resume.types";

interface AchievementImpactCardProps {
  achievement: AchievementImpact;
}

export const AchievementImpactCard: React.FC<AchievementImpactCardProps> = React.memo(({ achievement }) => {
  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
            <TrendingUp className="size-3.5 text-primary" />
            <span>Impact Score</span>
          </div>
          <div className="text-2xl font-bold text-primary">{achievement.impactScore}/100</div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-primary h-full transition-all" style={{ width: `${achievement.impactScore}%` }} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
            <Award className="size-3.5 text-emerald-500" />
            <span>Achievement Score</span>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{achievement.achievementScore}/100</div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${achievement.achievementScore}%` }} />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-4 space-y-2 text-center">
          <div className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase text-muted-foreground">
            <Target className="size-3.5 text-amber-500" />
            <span>Quantification Score</span>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{achievement.quantificationScore}/100</div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-amber-500 h-full transition-all" style={{ width: `${achievement.quantificationScore}%` }} />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-foreground">
          <span>Bullet Quantification Ratio</span>
          <span>
            {achievement.quantifiedBulletsCount} of {achievement.totalBulletsCount} bullets quantified ({Math.round((achievement.quantifiedBulletsCount / (achievement.totalBulletsCount || 1)) * 100)}%)
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <div
            className="bg-primary h-full transition-all"
            style={{ width: `${Math.round((achievement.quantifiedBulletsCount / (achievement.totalBulletsCount || 1)) * 100)}%` }}
          />
        </div>
      </div>

      {achievement.weakBullets.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
            <AlertCircle className="size-4" />
            <span>Bullets Lacking Measurable Metrics</span>
          </h4>
          <div className="space-y-2.5">
            {achievement.weakBullets.map((item, idx) => (
              <div key={idx} className="p-3 rounded-md border border-destructive/20 bg-destructive/5 space-y-1">
                <p className="text-xs font-mono text-foreground leading-relaxed">"{item.bullet}"</p>
                <p className="text-[11px] text-destructive font-medium">Issue: {item.issue}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {achievement.strongBullets.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span>High Impact Quantified Bullets</span>
          </h4>
          <div className="space-y-2">
            {achievement.strongBullets.map((bullet, idx) => (
              <div key={idx} className="p-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-xs font-mono text-foreground">
                "{bullet}"
              </div>
            ))}
          </div>
        </div>
      )}

      {achievement.recommendations.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
            Impact Enhancement Recommendations
          </h4>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/90 leading-relaxed">
            {achievement.recommendations.map((rec, idx) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
