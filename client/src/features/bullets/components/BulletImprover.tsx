import React, { useState } from "react";
import { useIsMutating } from "@tanstack/react-query";
import {
  Wand2,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Edit3,
  History,
} from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { FullPageLoader } from "@/components/ui/loader";
import {
  useBulletHistory,
  useImproveBullet,
  useUpdateBulletStatus,
  useRegenerateBullet,
} from "../hooks/useBullets";
import type { BulletImprovementRecord } from "../types/bullet.types";

interface BulletImproverProps {
  resumeId: string;
  targetRole: string;
  extractedText?: string;
}

export const BulletImprover: React.FC<BulletImproverProps> = ({
  resumeId,
  targetRole,
}) => {
  const { data: historyData, isLoading: isHistoryLoading } = useBulletHistory(resumeId);
  const improveMutation = useImproveBullet(resumeId);
  const updateStatusMutation = useUpdateBulletStatus(resumeId);
  const regenerateMutation = useRegenerateBullet(resumeId);

  const isGlobalImproving = useIsMutating({ mutationKey: ["improveBullet", resumeId] }) > 0;
  const isImproving = improveMutation.isPending || isGlobalImproving;

  const [inputBullet, setInputBullet] = useState("");
  const [copiedIndex, setCopiedIndex] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const bullets = historyData?.bullets || [];

  const handleImprove = async () => {
    if (!inputBullet.trim() || isImproving) return;
    try {
      await improveMutation.mutateAsync({
        originalBullet: inputBullet.trim(),
        targetRole,
      });
      setInputBullet("");
      toast.success("Bullet improved cleanly with 3 variations!");
    } catch (err: any) {
      if (axios.isCancel(err) || err?.name === "CanceledError") return;
      toast.error(err?.response?.data?.message || "Failed to improve bullet");
    }
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(key);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const handleStatusUpdate = async (bulletId: string, status: "accepted" | "discarded", selectedSuggestion?: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        bulletId,
        input: { status, selectedSuggestion },
      });
      toast.success(`Bullet marked as ${status}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  const handleRegenerate = async (bulletId: string) => {
    try {
      await regenerateMutation.mutateAsync(bulletId);
      toast.success("Fresh bullet variations generated!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Regeneration failed");
    }
  };

  const startEdit = (recordId: string, text: string) => {
    setEditingId(recordId);
    setEditText(text);
  };

  const saveEdit = async (record: BulletImprovementRecord) => {
    const recordId = record._id || record.id || "";
    if (!editText.trim()) return;
    await handleStatusUpdate(recordId, "accepted", editText.trim());
    setEditingId(null);
  };

  return (
    <div className="space-y-6 font-sans">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-wider">
            <Wand2 className="size-4 text-primary" />
            <span>AI Bullet Improver</span>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Target Role: <span className="font-semibold text-foreground">{targetRole}</span>
          </span>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground">
            Paste or type an existing resume bullet point to rewrite:
          </label>
          <Textarea
            rows={3}
            placeholder="e.g. Responsible for managing database backups and optimizing database performance for high traffic apps."
            value={inputBullet}
            onChange={(e) => setInputBullet(e.target.value)}
            className="text-xs font-mono resize-none"
          />
        </div>

        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={handleImprove}
            disabled={isImproving || !inputBullet.trim()}
            className="gap-2 text-xs font-semibold h-8 px-4"
          >
            {isImproving ? (
              <>
                <Spinner />
                <span>Improving bullet...</span>
              </>
            ) : (
              <>
                <Sparkles className="size-3.5" />
                <span>Improve Bullet</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <History className="size-3.5" />
            <span>Bullet Improvements ({bullets.length})</span>
          </h3>
        </div>

        {isHistoryLoading ? (
          <div className="p-6 rounded-lg border border-border bg-card flex items-center justify-center">
            <FullPageLoader subtitle="Loading bullet improvement history..." />
          </div>
        ) : bullets.length === 0 ? (
          <div className="p-8 rounded-lg border border-dashed border-border bg-card/40 text-center space-y-2">
            <Wand2 className="size-6 text-muted-foreground mx-auto" />
            <p className="text-xs text-muted-foreground">
              No bullets improved yet. Paste a bullet above to generate impact-driven rewrites.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {bullets.map((record) => {
              const recordId = record._id || record.id || "";
              const isRegenerating = regenerateMutation.isPending && regenerateMutation.variables === recordId;

              return (
                <div
                  key={recordId}
                  className={`rounded-lg border p-5 space-y-4 transition-colors ${
                    record.status === "accepted"
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : record.status === "discarded"
                      ? "border-destructive/20 bg-destructive/5 opacity-75"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="flex items-center justify-between border-b border-border/60 pb-3 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Original Bullet
                      </span>
                      {record.status === "accepted" && (
                        <Badge variant="success" className="text-[10px] py-0 px-2 flex items-center gap-1">
                          <CheckCircle2 className="size-3" />
                          <span>Accepted</span>
                        </Badge>
                      )}
                      {record.status === "discarded" && (
                        <Badge variant="destructive" className="text-[10px] py-0 px-2 flex items-center gap-1">
                          <XCircle className="size-3" />
                          <span>Discarded</span>
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegenerate(recordId)}
                        disabled={isRegenerating}
                        className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground px-2"
                      >
                        <RotateCcw className={`size-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
                        <span>Regenerate</span>
                      </Button>

                      {record.status !== "discarded" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStatusUpdate(recordId, "discarded")}
                          className="h-7 text-xs gap-1 text-destructive hover:bg-destructive/10 px-2"
                        >
                          <XCircle className="size-3.5" />
                          <span>Discard</span>
                        </Button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs font-mono bg-background p-3 rounded-md border border-border text-foreground/90 leading-relaxed break-words max-w-full">
                    "{record.originalBullet}"
                  </p>

                  {record.critique && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                        Recruiter Assessment
                      </span>
                      <p className="text-xs text-muted-foreground leading-relaxed break-words max-w-full">
                        {record.critique}
                      </p>
                    </div>
                  )}

                  <div className="space-y-3 pt-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                      Improved Variations
                    </span>

                    <div className="space-y-2.5">
                      {record.suggestions.map((suggestion, sIdx) => {
                        const copyKey = `${recordId}-${sIdx}`;
                        const isSelected = record.selectedSuggestion === suggestion;
                        const isEditingThis = editingId === `${recordId}-${sIdx}`;

                        return (
                          <div
                            key={sIdx}
                            className={`p-3 rounded-md border text-xs space-y-2.5 transition-colors ${
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10"
                                : "border-border/80 bg-muted/20 hover:bg-muted/40"
                            }`}
                          >
                            {isEditingThis ? (
                              <div className="space-y-2">
                                <Textarea
                                  rows={2}
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  className="text-xs font-mono bg-background resize-none"
                                />
                                <div className="flex items-center justify-end gap-2 flex-wrap">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingId(null)}
                                    className="h-6 text-xs px-2"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => saveEdit(record)}
                                    className="h-6 text-xs px-2"
                                  >
                                    Save & Accept
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="font-mono text-foreground leading-relaxed break-words max-w-full">
                                  "{suggestion}"
                                </p>

                                <div className="flex items-center justify-between pt-1 border-t border-border/40">
                                  <span className="text-[10px] text-muted-foreground font-medium">
                                    Option {sIdx + 1}
                                  </span>

                                  <div className="flex items-center gap-1.5">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleCopy(suggestion, copyKey)}
                                      className="h-6 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
                                    >
                                      {copiedIndex === copyKey ? (
                                        <>
                                          <Check className="size-3 text-emerald-600" />
                                          <span>Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="size-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEdit(`${recordId}-${sIdx}`, suggestion)}
                                      className="h-6 text-[11px] gap-1 px-2 text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit3 className="size-3" />
                                      <span>Edit</span>
                                    </Button>

                                    <Button
                                      size="sm"
                                      variant={isSelected ? "default" : "outline"}
                                      onClick={() => handleStatusUpdate(recordId, "accepted", suggestion)}
                                      className="h-6 text-[11px] gap-1 px-2.5 font-semibold"
                                    >
                                      <CheckCircle2 className="size-3" />
                                      <span>{isSelected ? "Selected" : "Accept"}</span>
                                    </Button>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
