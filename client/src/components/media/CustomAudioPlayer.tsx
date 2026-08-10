import React, { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Music, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CustomAudioPlayerProps {
  src: string;
  originalFileName?: string;
}

export const CustomAudioPlayer: React.FC<CustomAudioPlayerProps> = ({
  src,
  originalFileName = "Audio Introduction",
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "00:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m < 10 ? "0" : ""}${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="w-full p-4 rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card shadow-sm space-y-3 font-sans">
      <audio ref={audioRef} src={src} preload="metadata" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isPlaying ? "bg-primary text-white shadow-md animate-pulse" : "bg-primary/10 text-primary"
          }`}>
            <Music className="size-5" />
          </div>
          <div className="min-w-0 space-y-0.5">
            <p className="font-bold text-xs text-foreground truncate">{originalFileName}</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] text-primary border-primary/30 py-0">
                Voice Recording
              </Badge>
              <span className="text-[10px] font-mono text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
              }
            }}
            className="size-8 p-0 text-muted-foreground"
          >
            <RotateCcw className="size-3.5" />
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={togglePlay}
            className="size-9 rounded-full font-bold p-0 shadow-md"
          >
            {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 ml-0.5" />}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleMute}
            className="size-8 p-0 text-muted-foreground"
          >
            {isMuted ? <VolumeX className="size-4 text-destructive" /> : <Volume2 className="size-4" />}
          </Button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="relative w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-primary transition-all duration-100"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};
