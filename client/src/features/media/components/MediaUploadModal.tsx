import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Camera,
  FileVideo,
  Mic,
  FileAudio,
  UploadCloud,
  Loader2,
  Square,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useUploadResumeIntro } from "@/features/resumes/hooks/useResumeIntro";

interface MediaUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type InputTab = "record_video" | "upload_video" | "record_audio" | "upload_audio";

export const MediaUploadModal: React.FC<MediaUploadModalProps> = ({
  open,
  onOpenChange,
}) => {
  const [activeTab, setActiveTab] = useState<InputTab>("upload_video");
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("Self Introduction Video");

  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordTimer, setRecordTimer] = useState(0);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const videoPreviewRef = useRef<HTMLVideoElement | null>(null);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const uploadIntroMutation = useUploadResumeIntro();

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
      toast.error(`Failed to access media device: ${err.message}`);
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
      toast.error("Please record or select a video/audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("targetRole", title);
    formData.append("originalName", file.name);

    try {
      await uploadIntroMutation.mutateAsync(formData);
      toast.success("Upload queued to AWS S3!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to submit upload");
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl font-sans p-6 bg-card border-border shadow-2xl">
        <DialogHeader className="border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-primary" />
            <DialogTitle className="text-base font-bold text-foreground">
              Record / Upload Introduction Media
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Button
              type="button"
              variant={activeTab === "record_video" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveTab("record_video");
                startRecording("video");
              }}
              className="gap-1.5 text-xs font-semibold h-10 flex flex-col items-center justify-center py-6"
            >
              <Camera className="size-4 text-primary" />
              <span>Record Video</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === "upload_video" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveTab("upload_video");
                stopMediaStream();
              }}
              className="gap-1.5 text-xs font-semibold h-10 flex flex-col items-center justify-center py-6"
            >
              <FileVideo className="size-4 text-primary" />
              <span>Upload Video</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === "record_audio" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveTab("record_audio");
                startRecording("audio");
              }}
              className="gap-1.5 text-xs font-semibold h-10 flex flex-col items-center justify-center py-6"
            >
              <Mic className="size-4 text-primary" />
              <span>Record Audio</span>
            </Button>

            <Button
              type="button"
              variant={activeTab === "upload_audio" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveTab("upload_audio");
                stopMediaStream();
              }}
              className="gap-1.5 text-xs font-semibold h-10 flex flex-col items-center justify-center py-6"
            >
              <FileAudio className="size-4 text-primary" />
              <span>Upload Audio</span>
            </Button>
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            {activeTab === "record_video" && (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden bg-black aspect-video flex items-center justify-center border border-border">
                  {previewBlobUrl ? (
                    <video src={previewBlobUrl} controls className="w-full h-full object-contain" />
                  ) : (
                    <video ref={videoPreviewRef} muted autoPlay playsInline className="w-full h-full object-contain" />
                  )}
                  {isRecording && (
                    <Badge variant="destructive" className="absolute top-3 right-3 text-xs gap-1.5 animate-pulse">
                      <span className="size-2 rounded-full bg-white" />
                      {isPaused ? "PAUSED" : "REC"} {formatTimer(recordTimer)}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {!isRecording && !previewBlobUrl && (
                    <Button type="button" size="sm" onClick={() => startRecording("video")} className="gap-2 font-bold text-xs">
                      <Camera className="size-4" /> Start Camera
                    </Button>
                  )}

                  {isRecording && (
                    <>
                      {isPaused ? (
                        <Button type="button" variant="outline" size="sm" onClick={resumeRecording} className="gap-1 text-xs">
                          <Play className="size-3.5" /> Resume
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={pauseRecording} className="gap-1 text-xs">
                          <Pause className="size-3.5" /> Pause
                        </Button>
                      )}
                      <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="gap-1 text-xs font-bold">
                        <Square className="size-3.5" /> Stop
                      </Button>
                    </>
                  )}

                  {previewBlobUrl && (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={() => startRecording("video")} className="gap-1 text-xs">
                        <RotateCcw className="size-3.5" /> Re-record
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={deleteRecording} className="gap-1 text-xs text-destructive">
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
                    <div className="size-16 rounded-full bg-primary/20 text-primary mx-auto flex items-center justify-center">
                      <Mic className="size-8" />
                    </div>
                    {isRecording && (
                      <p className="text-xs font-mono font-bold text-rose-500 animate-pulse">
                        {isPaused ? "PAUSED" : "Recording Audio..."} {formatTimer(recordTimer)}
                      </p>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {!isRecording && !previewBlobUrl && (
                    <Button type="button" size="sm" onClick={() => startRecording("audio")} className="gap-2 font-bold text-xs">
                      <Mic className="size-4" /> Start Recording
                    </Button>
                  )}

                  {isRecording && (
                    <>
                      {isPaused ? (
                        <Button type="button" variant="outline" size="sm" onClick={resumeRecording} className="gap-1 text-xs">
                          <Play className="size-3.5" /> Resume
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" size="sm" onClick={pauseRecording} className="gap-1 text-xs">
                          <Pause className="size-3.5" /> Pause
                        </Button>
                      )}
                      <Button type="button" variant="destructive" size="sm" onClick={stopRecording} className="gap-1 text-xs font-bold">
                        <Square className="size-3.5" /> Stop
                      </Button>
                    </>
                  )}

                  {previewBlobUrl && (
                    <>
                      <Button type="button" variant="outline" size="sm" onClick={() => startRecording("audio")} className="gap-1 text-xs">
                        <RotateCcw className="size-3.5" /> Re-record
                      </Button>
                      <Button type="button" variant="ghost" size="sm" onClick={deleteRecording} className="gap-1 text-xs text-destructive">
                        <Trash2 className="size-3.5" /> Delete
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}

            {(activeTab === "upload_video" || activeTab === "upload_audio") && (
              <div className="relative border-2 border-dashed border-border hover:border-primary/50 rounded-xl p-6 text-center transition-colors bg-card cursor-pointer">
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
                <div className="space-y-2 pointer-events-none">
                  <UploadCloud className="size-8 text-primary/60 mx-auto" />
                  {file ? (
                    <div>
                      <p className="font-bold text-xs text-foreground">{file.name}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {(file.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-semibold text-xs text-foreground">
                        Click or drag to upload {activeTab === "upload_video" ? "Video" : "Audio"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {activeTab === "upload_video" ? "MP4, MOV, WEBM (Max 200MB)" : "MP3, WAV, M4A (Max 200MB)"}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <Label htmlFor="title" className="text-xs font-semibold">
                Title / Label
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Senior Full Stack Engineer Introduction"
                className="text-xs h-9"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleUploadSubmit}
                disabled={uploadIntroMutation.isPending || !file}
                className="font-bold text-xs gap-2"
              >
                {uploadIntroMutation.isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="size-4" />
                    <span>Upload to AWS S3</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default MediaUploadModal;
