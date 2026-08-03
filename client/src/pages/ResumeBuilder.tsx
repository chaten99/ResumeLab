import React, { useState, useRef, useEffect } from "react";
import {
  Video,
  Mic,
  UploadCloud,
  FileVideo,
  Camera,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Loader2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LayoutTemplate,
  Clock,
  Check,
  RefreshCw,
  Film,
  Music,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageTransition } from "@/components/layout/PageTransition";
import { toast } from "sonner";
import {
  useUploadResumeIntro,
  useLatestResumeIntro,
  useDeleteResumeIntro,
} from "@/features/resumes/hooks/useResumeIntro";
import { useSocketContext } from "@/providers/SocketProvider";
import { useQueryClient } from "@tanstack/react-query";
import { CustomMediaPlayer } from "@/components/media/CustomMediaPlayer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type InputTab = "record_video" | "upload_video" | "record_audio" | "upload_audio";

export const ResumeBuilder: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);
  const [activeTab, setActiveTab] = useState<InputTab>("upload_video");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Full Stack Developer");

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [activeSocketJob, setActiveSocketJob] = useState<{
    resumeId: string;
    status: "QUEUED" | "UPLOADING" | "COMPLETED" | "FAILED";
    progress: number;
    failureReason?: string;
    media?: any;
  } | null>(null);

  const queryClient = useQueryClient();
  const { socket } = useSocketContext();
  const uploadIntroMutation = useUploadResumeIntro();
  const deleteIntroMutation = useDeleteResumeIntro();
  const { data: latestIntroData, isLoading: isLatestLoading } = useLatestResumeIntro();

  const attachedResume = latestIntroData?.resume;
  const attachedMedia = activeSocketJob?.media || latestIntroData?.media || attachedResume?.media;

  useEffect(() => {
    return () => {
      stopMediaStream();
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleQueued = (data: any) => {
      setActiveSocketJob({
        resumeId: data.resumeId,
        status: "QUEUED",
        progress: 10,
      });
    };

    const handleUploading = (data: any) => {
      setActiveSocketJob((prev) => ({
        resumeId: data.resumeId,
        status: "UPLOADING",
        progress: Math.max(prev?.progress || 0, data.progress || 25),
      }));
    };

    const handleProgress = (data: any) => {
      setActiveSocketJob((prev) =>
        prev && prev.resumeId === data.resumeId
          ? { ...prev, status: "UPLOADING", progress: Math.max(prev.progress, data.progress) }
          : prev
      );
    };

    const handleCompleted = (data: any) => {
      setActiveSocketJob({
        resumeId: data.resumeId,
        status: "COMPLETED",
        progress: 100,
        media: data.media,
      });
      toast.success("Self-introduction uploaded successfully!");
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    };

    const handleFailed = (data: any) => {
      setActiveSocketJob({
        resumeId: data.resumeId,
        status: "FAILED",
        progress: 0,
        failureReason: data.failureReason,
      });
      toast.error(data.failureReason || "Upload failed. Please try again.");
    };

    socket.on("resume:queued", handleQueued);
    socket.on("resume:uploading", handleUploading);
    socket.on("resume:progress", handleProgress);
    socket.on("resume:completed", handleCompleted);
    socket.on("resume:failed", handleFailed);

    return () => {
      socket.off("resume:queued", handleQueued);
      socket.off("resume:uploading", handleUploading);
      socket.off("resume:progress", handleProgress);
      socket.off("resume:completed", handleCompleted);
      socket.off("resume:failed", handleFailed);
    };
  }, [socket, queryClient]);

  const stopMediaStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async (type: "video" | "audio") => {
    stopMediaStream();
    setPreviewBlobUrl(null);
    setFile(null);
    recordedChunksRef.current = [];
    setRecordTimer(0);
    setIsPaused(false);

    try {
      const constraints: MediaStreamConstraints =
        type === "video" ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      mediaStreamRef.current = stream;

      if (type === "video" && videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
        videoPreviewRef.current.play();
      }

      const recorder = new MediaRecorder(stream, {
        mimeType: type === "video" ? "video/webm" : "audio/webm",
      });

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const mime = type === "video" ? "video/webm" : "audio/webm";
        const blob = new Blob(recordedChunksRef.current, { type: mime });
        const filename = `recorded_${type}_${Date.now()}.webm`;
        const recordedFile = new File([blob], filename, { type: mime });

        setFile(recordedFile);
        setPreviewBlobUrl(URL.createObjectURL(blob));
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);

      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      toast.error(`Unable to access media device: ${err.message}`);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording && !isPaused) {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && isRecording && isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
      timerIntervalRef.current = setInterval(() => {
        setRecordTimer((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      stopMediaStream();
    }
  };

  const deleteRecording = () => {
    stopRecording();
    setPreviewBlobUrl(null);
    setFile(null);
    setRecordTimer(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (selected.size > 200 * 1024 * 1024) {
        toast.error("File size exceeds 200 MB limit.");
        return;
      }
      setFile(selected);
    }
  };

  const handleUploadSubmit = async () => {
    if (!file) {
      toast.error("Please record or select a video or audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetRole", targetRole);
    formData.append("originalName", file.name);

    try {
      await uploadIntroMutation.mutateAsync(formData);
      toast.success("Upload started!");
      setDialogOpen(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit upload");
    }
  };

  const handleConfirmDelete = async () => {
    if (attachedResume?._id) {
      try {
        await deleteIntroMutation.mutateAsync(attachedResume._id);
        setActiveSocketJob(null);
        toast.success("Introduction removed successfully");
      } catch {
        toast.error("Failed to remove introduction");
      }
    }
    setConfirmDeleteOpen(false);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <PageTransition>
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8 font-sans">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Sparkles className="size-6 text-primary" /> Interactive Resume Builder
              </h1>
              <p className="text-xs text-muted-foreground">
                Create a professional resume with an embedded video or audio introduction.
              </p>
            </div>

            <Badge variant="outline" className="text-xs font-bold px-3 py-1 border-primary/30 text-primary">
              Step {currentStep} of 4
            </Badge>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { step: 1, title: "1. Self-Introduction", desc: "Upload Video / Audio", active: currentStep === 1, done: currentStep > 1 || !!attachedMedia?.url },
              { step: 2, title: "2. Review Details", desc: "AI Speech Extraction", active: currentStep === 2, done: currentStep > 2 },
              { step: 3, title: "3. Resume Design", desc: "Choose Template", active: currentStep === 3, done: currentStep > 3 },
              { step: 4, title: "4. Final Output", desc: "Preview & Download", active: currentStep === 4, done: false },
            ].map((s) => (
              <div
                key={s.step}
                onClick={() => (s.done || s.step <= currentStep) && setCurrentStep(s.step as any)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  s.active
                    ? "border-primary bg-primary/10 shadow-md"
                    : s.done
                    ? "border-emerald-500/40 bg-emerald-500/5"
                    : "border-border/60 bg-card opacity-60"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`size-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    s.done ? "bg-emerald-500 text-white" : s.active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {s.done ? <Check className="size-3.5" /> : s.step}
                  </span>
                  {s.done && <Badge variant="outline" className="text-[9px] text-emerald-500 border-emerald-500/30">Done</Badge>}
                </div>
                <p className="font-bold text-xs text-foreground mt-2">{s.title}</p>
                <p className="text-[10px] text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {currentStep === 1 && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl border border-border bg-card shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
                <div>
                  <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Video className="size-5 text-primary" /> Step 1: Self-Introduction Media
                  </h2>
                  <p className="text-xs text-muted-foreground max-w-xl">
                    Record or upload a 1-2 minute video or audio introduction highlighting your experience and skills.
                  </p>
                </div>

                <Button
                  onClick={() => {
                    setActiveTab("upload_video");
                    setDialogOpen(true);
                  }}
                  className="font-bold text-xs gap-2 shadow-lg shadow-primary/20 shrink-0"
                >
                  <UploadCloud className="size-4" /> Upload Introduction
                </Button>
              </div>

              {activeSocketJob && activeSocketJob.status !== "COMPLETED" && activeSocketJob.status !== "FAILED" && (
                <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 text-foreground space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Loader2 className="size-5 text-primary animate-spin shrink-0" />
                      <div>
                        <p className="font-bold text-xs">Uploading your self-introduction...</p>
                        <p className="text-[11px] text-muted-foreground">Please wait while your media is processed.</p>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px] font-bold text-primary border-primary/30">
                      {activeSocketJob.progress}%
                    </Badge>
                  </div>

                  <Progress value={activeSocketJob.progress} className="h-2 bg-primary/20" />
                </div>
              )}

              {isLatestLoading ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Loading self-introduction...</div>
              ) : attachedMedia?.url ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="size-5 text-emerald-500" />
                        <span className="font-bold text-sm text-foreground">Self-Introduction Attached</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30 font-bold">
                        Attached &amp; Ready
                      </Badge>
                    </div>

                    <CustomMediaPlayer
                      src={attachedMedia.url}
                      resourceType={attachedMedia.type || "video"}
                      originalFileName={attachedMedia.originalName}
                    />

                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="size-3.5" /> Uploaded {new Date(attachedMedia.uploadedAt || Date.now()).toLocaleDateString()}
                      </span>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDeleteOpen(true)}
                          className="text-xs text-destructive hover:bg-destructive/10 gap-1 h-7"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveTab("upload_video");
                            setDialogOpen(true);
                          }}
                          className="text-xs font-bold gap-1 h-7"
                        >
                          <RefreshCw className="size-3" /> Replace
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end pt-2">
                    <Button size="sm" onClick={() => setCurrentStep(2)} className="font-bold text-xs gap-1.5 shadow-md">
                      <span>Continue to Step 2 (Review Details)</span>
                      <ArrowRight className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-10 text-center border-2 border-dashed border-border rounded-xl space-y-4 bg-muted/10">
                  <div className="size-16 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                    <UploadCloud className="size-8" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-foreground">No Self-Introduction Added Yet</p>
                    <p className="text-xs text-muted-foreground max-w-md mx-auto">
                      Record a short video/audio introduction using your camera or microphone, or upload a media file to get started.
                    </p>
                  </div>
                  <Button
                    onClick={() => {
                      setActiveTab("upload_video");
                      setDialogOpen(true);
                    }}
                    className="font-bold text-xs gap-2"
                  >
                    <Camera className="size-4" /> Add Introduction
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6 text-center">
            <div className="size-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center">
              <Sparkles className="size-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">Step 2: Review Extracted Details</h2>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Our speech extraction service will process your recorded introduction to populate skills, work history, and key project achievements.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(1)}>
                Back to Step 1
              </Button>
              <Button size="sm" onClick={() => setCurrentStep(3)}>
                Continue to Step 3 (Templates)
              </Button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6 text-center">
            <div className="size-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center">
              <LayoutTemplate className="size-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">Step 3: Choose Resume Design</h2>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Select an ATS-optimized, modern layout template for your resume.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button variant="outline" size="sm" onClick={() => setCurrentStep(2)}>
                Back to Step 2
              </Button>
              <Button size="sm" onClick={() => setCurrentStep(4)}>
                Continue to Step 4 (Generate)
              </Button>
            </div>
          </div>
        )}

        {currentStep === 4 && (
          <div className="p-8 rounded-2xl border border-border bg-card shadow-lg space-y-6 text-center">
            <div className="size-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-foreground">Step 4: Interactive Output Ready</h2>
              <p className="text-xs text-muted-foreground max-w-lg mx-auto">
                Your interactive resume with attached video/audio introduction is ready.
              </p>
            </div>
            <Button size="sm" onClick={() => setCurrentStep(1)}>
              Start Over
            </Button>
          </div>
        )}

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-2xl font-sans p-6 bg-card border-border shadow-2xl rounded-2xl">
            <DialogHeader className="border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <Video className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-foreground">
                    Add Self-Introduction
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground">
                    Choose how you would like to introduce yourself for your resume.
                  </p>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-3">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "record_video", title: "Record Video", desc: "Camera & Mic", icon: Film },
                  { id: "upload_video", title: "Upload Video", desc: "MP4, WEBM", icon: FileVideo },
                  { id: "record_audio", title: "Record Audio", desc: "Microphone", icon: Mic },
                  { id: "upload_audio", title: "Upload Audio", desc: "MP3, WAV", icon: Music },
                ].map((item) => {
                  const Icon = item.icon;
                  const selected = activeTab === item.id;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        stopMediaStream();
                        setPreviewBlobUrl(null);
                        setFile(null);
                        setIsRecording(false);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selected
                          ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
                          : "border-border/80 bg-muted/20 hover:border-border hover:bg-muted/40"
                      }`}
                    >
                      <div className={`size-8 rounded-lg flex items-center justify-center mb-2 ${
                        selected ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                      }`}>
                        <Icon className="size-4" />
                      </div>
                      <p className="font-bold text-xs text-foreground">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground">{item.desc}</p>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border/80 bg-muted/20 p-5 space-y-4">
                {activeTab === "record_video" && (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-border shadow-inner">
                      {previewBlobUrl ? (
                        <video src={previewBlobUrl} controls className="w-full h-full object-contain" />
                      ) : (
                        <video ref={videoPreviewRef} muted autoPlay playsInline className="w-full h-full object-contain" />
                      )}
                      {isRecording && (
                        <Badge variant="destructive" className="absolute top-3 right-3 text-xs gap-1.5 animate-pulse shadow-md">
                          <span className="size-2 rounded-full bg-white" />
                          {isPaused ? "PAUSED" : "REC"} {formatTimer(recordTimer)}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {!isRecording && !previewBlobUrl && (
                        <Button type="button" size="sm" onClick={() => startRecording("video")} className="gap-2 font-bold text-xs shadow-md">
                          <Camera className="size-4" /> Start Camera Recording
                        </Button>
                      )}

                      {isRecording && (
                        <>
                          {isPaused ? (
                            <Button type="button" variant="outline" size="sm" onClick={resumeRecording} className="gap-1.5 text-xs font-bold">
                              <Play className="size-3.5" /> Resume
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" onClick={pauseRecording} className="gap-1.5 text-xs font-bold">
                              <Pause className="size-3.5" /> Pause
                            </Button>
                          )}

                          <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5 text-xs font-bold shadow-md">
                            <Square className="size-3.5" /> Stop Recording
                          </Button>
                        </>
                      )}

                      {previewBlobUrl && (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => startRecording("video")} className="gap-1.5 text-xs font-bold">
                            <RotateCcw className="size-3.5" /> Re-record
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={deleteRecording} className="gap-1.5 text-xs text-destructive font-bold">
                            <Trash2 className="size-3.5" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === "record_audio" && (
                  <div className="space-y-4 py-4 text-center">
                    {previewBlobUrl ? (
                      <audio src={previewBlobUrl} controls className="w-full" />
                    ) : (
                      <div className="space-y-3">
                        <div className="size-20 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center shadow-lg border border-primary/30 animate-pulse">
                          <Mic className="size-10" />
                        </div>
                        {isRecording ? (
                          <p className="text-xs font-mono font-bold text-rose-500 animate-pulse">
                            {isPaused ? "PAUSED" : "Recording Audio..."} {formatTimer(recordTimer)}
                          </p>
                        ) : (
                          <p className="text-xs text-muted-foreground">Click below to start voice recording</p>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-center gap-2 flex-wrap">
                      {!isRecording && !previewBlobUrl && (
                        <Button type="button" size="sm" onClick={() => startRecording("audio")} className="gap-2 font-bold text-xs shadow-md">
                          <Mic className="size-4" /> Start Voice Recording
                        </Button>
                      )}

                      {isRecording && (
                        <>
                          {isPaused ? (
                            <Button type="button" variant="outline" size="sm" onClick={resumeRecording} className="gap-1.5 text-xs font-bold">
                              <Play className="size-3.5" /> Resume
                            </Button>
                          ) : (
                            <Button type="button" variant="outline" size="sm" onClick={pauseRecording} className="gap-1.5 text-xs font-bold">
                              <Pause className="size-3.5" /> Pause
                            </Button>
                          )}

                          <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5 text-xs font-bold shadow-md">
                            <Square className="size-3.5" /> Stop Recording
                          </Button>
                        </>
                      )}

                      {previewBlobUrl && (
                        <>
                          <Button type="button" variant="outline" size="sm" onClick={() => startRecording("audio")} className="gap-1.5 text-xs font-bold">
                            <RotateCcw className="size-3.5" /> Re-record
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={deleteRecording} className="gap-1.5 text-xs text-destructive font-bold">
                            <Trash2 className="size-3.5" /> Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {(activeTab === "upload_video" || activeTab === "upload_audio") && (
                  <div className="relative border-2 border-dashed border-border hover:border-primary/60 rounded-xl p-8 text-center transition-colors bg-card cursor-pointer group">
                    <input
                      type="file"
                      accept={
                        activeTab === "upload_video"
                          ? ".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
                          : ".mp3,.wav,.m4a,audio/mpeg,audio/wav,audio/m4a"
                      }
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div className="space-y-3 pointer-events-none">
                      <div className="size-14 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                        <UploadCloud className="size-7" />
                      </div>
                      {file ? (
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-foreground">{file.name}</p>
                          <Badge variant="secondary" className="text-[10px]">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </Badge>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-foreground">
                            Click or drag to select {activeTab === "upload_video" ? "Video" : "Audio"} file
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {activeTab === "upload_video" ? "Supported: MP4, MOV, WEBM (Up to 200MB)" : "Supported: MP3, WAV, M4A (Up to 200MB)"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="targetRole" className="text-xs font-semibold text-foreground">
                    Target Position / Job Title
                  </Label>
                  <Input
                    id="targetRole"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="text-xs h-9"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/80">
                  <Button type="button" variant="outline" size="sm" onClick={() => setDialogOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={uploadIntroMutation.isPending || !file}
                    className="font-bold text-xs gap-2 shadow-md"
                  >
                    {uploadIntroMutation.isPending ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="size-4" />
                        <span>Save Introduction</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="sm:max-w-md font-sans p-6 bg-card border-border shadow-xl rounded-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                <DialogTitle className="text-base font-bold">Remove Introduction?</DialogTitle>
              </div>
            </DialogHeader>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to remove this attached self-introduction media? You can record or upload a new one anytime.
            </p>

            <div className="flex items-center justify-end gap-2 pt-3">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeleteOpen(false)} className="text-xs">
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={handleConfirmDelete} className="text-xs font-bold">
                Remove Media
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
};

export default ResumeBuilder;
