"use client";

import { useState, useEffect } from "react";
import VideoIntro from "./VideoIntro";

interface HomeWrapperProps {
  children: React.ReactNode;
}

const SESSION_KEY = "video_intro_shown";

export default function HomeWrapper({ children }: HomeWrapperProps) {
  const [showIntro, setShowIntro] = useState(true);
  const [contentVisible, setContentVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const hasSeenIntro = sessionStorage.getItem(SESSION_KEY);
    if (hasSeenIntro) {
      setShowIntro(false);
      setContentVisible(true);
    }
  }, []);

  const handleIntroComplete = () => {
    sessionStorage.setItem(SESSION_KEY, "true");
    setContentVisible(true);
    setTimeout(() => setShowIntro(false), 800);
  };

  return (
    <>
      {showIntro && mounted && <VideoIntro onComplete={handleIntroComplete} />}
      <div
        className={`transition-opacity duration-700 ease-out ${
          contentVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </div>
    </>
  );
}
