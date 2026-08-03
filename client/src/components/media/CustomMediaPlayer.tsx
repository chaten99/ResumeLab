import React, { useRef, useState, useEffect } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Video,
  Mic,
  Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CustomMediaPlayerProps {
  src: string;
  resourceType?: "video" | "audio" | string;
  title?: string;
  originalFileName?: string;
  className?: string;
}

export const CustomMediaPlayer: React.FC<CustomMediaPlayerProps> = ({
  src,
  resourceType = "video",
  title,
  originalFileName,
  className = "",
}) => {
  const isVideo = resourceType === "video";
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration || 0);
    const handleEnded = () => setIsPlaying(false);

    media.addEventListener("timeupdate", handleTimeUpdate);
    media.addEventListener("loadedmetadata", handleLoadedMetadata);
    media.addEventListener("ended", handleEnded);

    return () => {
      media.removeEventListener("timeupdate", handleTimeUpdate);
      media.removeEventListener("loadedmetadata", handleLoadedMetadata);
      media.removeEventListener("ended", handleEnded);
    };
  }, [src]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
      setIsPlaying(false);
    } else {
      media.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const targetTime = parseFloat(e.target.value);
    media.currentTime = targetTime;
    setCurrentTime(targetTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const media = mediaRef.current;
    if (!media) return;
    const val = parseFloat(e.target.value);
    media.volume = val;
    setVolume(val);
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    const media = mediaRef.current;
    if (!media) return;
    if (isMuted) {
      media.muted = false;
      setIsMuted(false);
    } else {
      media.muted = true;
      setIsMuted(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    const media = mediaRef.current;
    if (!media) return;
    media.playbackRate = speed;
    setPlaybackSpeed(speed);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds === 0) return "00:00";
    const mins = Math.floor(timeInSeconds / 60);
    const secs = Math.floor(timeInSeconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div
      ref={containerRef}
      className={`relative group rounded-2xl overflow-hidden bg-card border border-border/80 shadow-xl flex flex-col justify-between font-sans ${className}`}
    >
      <div className="p-3 bg-gradient-to-b from-black/70 via-black/40 to-transparent flex items-center justify-between z-10">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary backdrop-blur-md">
            {isVideo ? <Video className="size-4" /> : <Mic className="size-4" />}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">{title || originalFileName}</p>
            <p className="text-[10px] text-zinc-300 truncate">{originalFileName}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-[9px] font-bold uppercase tracking-wider text-primary border-primary/30 shrink-0 bg-background/40 backdrop-blur-md">
          {resourceType}
        </Badge>
      </div>

      <div className="relative flex-1 flex items-center justify-center min-h-[240px] bg-black/90">
        {isVideo ? (
          <video
            ref={mediaRef as React.RefObject<HTMLVideoElement>}
            src={src}
            onClick={togglePlay}
            className="w-full max-h-[380px] object-contain cursor-pointer"
          />
        ) : (
          <div className="w-full py-10 px-6 flex flex-col items-center justify-center space-y-4">
            <div className="size-20 rounded-full bg-primary/20 text-primary flex items-center justify-center shadow-lg border border-primary/30 animate-pulse">
              <Mic className="size-10" />
            </div>
            <audio ref={mediaRef as React.RefObject<HTMLAudioElement>} src={src} />
            <p className="text-xs text-zinc-200 font-semibold">{title || originalFileName}</p>
          </div>
        )}
      </div>

      <div className="p-3 bg-gradient-to-t from-black/90 via-black/80 to-transparent space-y-2 z-10">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-zinc-700 accent-primary rounded-lg cursor-pointer transition-all"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-200">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="size-8 text-white hover:text-primary hover:bg-white/10 rounded-full"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-white" />}
            </Button>

            <span className="text-[11px] font-mono text-zinc-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="size-7 text-white hover:bg-white/10 rounded-full"
              >
                {isMuted || volume === 0 ? <VolumeX className="size-3.5" /> : <Volume2 className="size-3.5" />}
              </Button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-14 h-1 bg-zinc-700 accent-primary rounded-lg cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-1">
              <Gauge className="size-3 text-zinc-300" />
              <select
                value={playbackSpeed}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="bg-zinc-800 text-[10px] text-zinc-200 border border-zinc-700 rounded px-1.5 py-0.5 focus:outline-hidden cursor-pointer"
              >
                <option value={0.5}>0.5x</option>
                <option value={1.0}>1.0x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2.0}>2.0x</option>
              </select>
            </div>

            {isVideo && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="size-7 text-white hover:bg-white/10 rounded-full"
              >
                {isFullscreen ? <Minimize2 className="size-3.5" /> : <Maximize2 className="size-3.5" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomMediaPlayer;
