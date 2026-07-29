import React from "react";
import { Edit3, CheckCircle2, AlertTriangle, Lightbulb } from "lucide-react";
import type { GrammarWriting } from "../../types/resume.types";

interface GrammarWritingCardProps {
  grammar: GrammarWriting;
}

export const GrammarWritingCard: React.FC<GrammarWritingCardProps> = React.memo(({ grammar }) => {
  const met = grammar.metrics || {
    passiveVoiceCount: 0,
    buzzwordCount: 0,
    fillerWordCount: 0,
    repeatedWordCount: 0,
  };

  return (
    <div className="space-y-6 font-sans animate-in fade-in slide-in-from-bottom-2 duration-200">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Edit3 className="size-4 text-primary" />
              <h3 className="text-sm font-bold tracking-tight text-foreground">
                Grammar & Writing Quality Teardown
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Evaluates passive voice density, buzzword inflation, sentence flow, and verb strength.
            </p>
          </div>

          <div className="flex size-14 shrink-0 flex-col items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary font-bold">
            <span className="text-xl leading-none">{grammar.writingScore}</span>
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5">SCORE</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3 rounded-md border border-border bg-muted/20 text-center">
            <span className="text-lg font-bold text-foreground">{met.passiveVoiceCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Passive Sentences</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-muted/20 text-center">
            <span className="text-lg font-bold text-foreground">{met.buzzwordCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Unevidenced Buzzwords</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-muted/20 text-center">
            <span className="text-lg font-bold text-foreground">{met.fillerWordCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Filler Phrases</p>
          </div>
          <div className="p-3 rounded-md border border-border bg-muted/20 text-center">
            <span className="text-lg font-bold text-foreground">{met.repeatedWordCount}</span>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold">Repeated Words</p>
          </div>
        </div>
      </div>

      {grammar.weakSentences.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-destructive flex items-center gap-2">
            <AlertTriangle className="size-4" />
            <span>Sentences Needing Revision ({grammar.weakSentences.length})</span>
          </h4>
          <div className="space-y-2.5">
            {grammar.weakSentences.map((item, idx) => (
              <div key={idx} className="p-3 rounded-md border border-destructive/20 bg-destructive/5 space-y-1">
                <p className="text-xs font-mono text-foreground leading-relaxed">"{item.sentence}"</p>
                <p className="text-[11px] text-destructive font-medium">Issue: {item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {grammar.strongSentences.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-5 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle2 className="size-4" />
            <span>High-Impact Sentences ({grammar.strongSentences.length})</span>
          </h4>
          <div className="space-y-2">
            {grammar.strongSentences.map((sent, idx) => (
              <div key={idx} className="p-3 rounded-md border border-emerald-500/20 bg-emerald-500/5 text-xs font-mono text-foreground">
                "{sent}"
              </div>
            ))}
          </div>
        </div>
      )}

      {grammar.suggestions.length > 0 && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-5 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-2">
            <Lightbulb className="size-4" />
            <span>Writing Improvement Recommendations</span>
          </h4>
          <ul className="space-y-1.5 pl-4 list-disc text-xs text-foreground/90 leading-relaxed">
            {grammar.suggestions.map((sug, idx) => (
              <li key={idx}>{sug}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});
