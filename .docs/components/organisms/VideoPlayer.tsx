"use client";
import React, { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/atoms/Icon";
import { 
  PlayIcon, 
  PauseCircleIcon, 
  VolumeMaxIcon, 
  VolumeXIcon,
  Maximize01Icon
} from "@/icons/duotone";
import { Slider } from "@/components/atoms/Slider";

export interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  className?: string;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  poster,
  title,
  className = "",
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);
    const onEnded = () => setIsPlaying(false);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);
    video.addEventListener("ended", onEnded);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
      video.removeEventListener("ended", onEnded);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (videoRef.current) {
      videoRef.current.volume = val;
      if (val === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (timeInSeconds: number) => {
    const m = Math.floor(timeInSeconds / 60);
    const s = Math.floor(timeInSeconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl bg-gray-900 group aspect-video shadow-md ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        onClick={togglePlay}
      />
      
      {/* Big Center Play Button Overlay (when paused) */}
      {!isPlaying && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm shadow-xl">
            <Icon icon={PlayIcon} className="h-8 w-8 text-white ml-1" />
          </div>
        </button>
      )}

      {/* Bottom Controls Overlay */}
      <div 
        className={`
          absolute bottom-0 left-0 right-0 p-4 pt-16 bg-gradient-to-t from-black/80 to-transparent
          transition-opacity duration-300
          ${isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"}
        `}
      >
        <div className="flex items-center gap-4 text-white">
          <button onClick={togglePlay} className="hover:text-brand transition-colors">
            <Icon icon={isPlaying ? PauseCircleIcon : PlayIcon} size="md" />
          </button>
          
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="hover:text-brand transition-colors">
              <Icon icon={isMuted || volume === 0 ? VolumeXIcon : VolumeMaxIcon} size="sm" />
            </button>
            <div className="w-16 hidden sm:block">
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                showValue={false}
              />
            </div>
          </div>

          <div className="text-xs font-mono tracking-wider ml-2">
            {formatTime(currentTime)} <span className="text-white/50">/ {formatTime(duration)}</span>
          </div>
          
          <div className="flex-1 px-4 hidden sm:block">
            {/* Timeline seek slider with brand color */}
            <Slider
              min={0}
              max={duration || 100}
              step={0.1}
              value={currentTime}
              onChange={handleSeek}
              showValue={false}
            />
          </div>

          <button onClick={toggleFullscreen} className="hover:text-brand transition-colors ml-auto sm:ml-0">
            <Icon icon={Maximize01Icon} size="sm" />
          </button>
        </div>
      </div>
    </div>
  );
};
