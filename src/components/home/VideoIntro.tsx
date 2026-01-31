"use client";

import { useState, useRef, useEffect } from "react";

interface VideoIntroProps {
  onComplete: () => void;
}

export default function VideoIntro({ onComplete }: VideoIntroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleEnded = () => {
      setIsFading(true);
      onComplete();
    };

    video.addEventListener("ended", handleEnded);
    return () => video.removeEventListener("ended", handleEnded);
  }, [onComplete]);

  const handleSkip = () => {
    setIsFading(true);
    onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-[100] bg-black transition-opacity duration-700 ease-out ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-full object-cover"
      >
        <source src="/main.mp4" type="video/mp4" />
      </video>
      <button
        onClick={handleSkip}
        className="absolute bottom-8 right-8 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors"
      >
        Skip
      </button>
    </div>
  );
}
