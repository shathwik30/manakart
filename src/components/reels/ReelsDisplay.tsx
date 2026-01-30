"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Reel } from "@/lib/api";
import { Play, Pause, Volume2, VolumeX, Video, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface ReelsDisplayProps {
  reels: Reel[];
}

export function ReelsDisplay({ reels }: ReelsDisplayProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mutedIds, setMutedIds] = useState<Set<string>>(new Set());
  const videoRefs = useRef<Map<string, HTMLVideoElement>>(new Map());

  const handlePlayPause = (reelId: string) => {
    const video = videoRefs.current.get(reelId);
    if (!video) return;

    if (playingId === reelId) {
      video.pause();
      setPlayingId(null);
    } else {
      // Pause other videos
      videoRefs.current.forEach((v, id) => {
        if (id !== reelId) v.pause();
      });
      video.play();
      setPlayingId(reelId);
    }
  };

  const toggleMute = (reelId: string) => {
    const newMuted = new Set(mutedIds);
    if (mutedIds.has(reelId)) {
      newMuted.delete(reelId);
    } else {
      newMuted.add(reelId);
    }
    setMutedIds(newMuted);
  };

  if (reels.length === 0) {
    return (
      <div className="py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-24 h-24 rounded-2xl bg-gradient-to-br from-cream-200 to-gold-100 flex items-center justify-center mx-auto mb-6 shadow-lg"
        >
          <Video className="w-12 h-12 text-gold-600" />
        </motion.div>
        <h3 className="font-display text-2xl text-charcoal-900 mb-2">
          Coming Soon
        </h3>
        <p className="text-charcoal-600">
          New reels will be added shortly
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
      {reels.map((reel, index) => {
        const isPlaying = playingId === reel.id;
        const isMuted = mutedIds.has(reel.id);

        return (
          <motion.div
            key={reel.id}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              delay: index * 0.08,
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="group"
          >
            <div className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-gradient-to-br from-charcoal-900 to-charcoal-800 shadow-xl hover:shadow-2xl transition-all duration-500">
              {/* Premium border effect */}
              <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gold-400/30 transition-all duration-500 z-10" />

              {/* Video */}
              <video
                ref={(el) => {
                  if (el) videoRefs.current.set(reel.id, el);
                }}
                src={reel.videoUrl}
                poster={reel.thumbnail}
                loop
                muted={isMuted}
                playsInline
                className="w-full h-full object-cover"
                onPlay={() => setPlayingId(reel.id)}
                onPause={() => setPlayingId(null)}
              />

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-charcoal-900/20 opacity-60 group-hover:opacity-40 transition-opacity duration-500" />

              {/* Play/Pause overlay */}
              <AnimatePresence>
                {!isPlaying && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center z-20"
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePlayPause(reel.id)}
                      className="w-20 h-20 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-2xl hover:bg-gold-50 transition-colors group/play"
                      aria-label="Play reel"
                    >
                      <Play className="w-9 h-9 text-charcoal-900 fill-charcoal-900 ml-1.5 group-hover/play:text-gold-600 transition-colors" />
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Controls overlay */}
              <div className={cn(
                "absolute top-0 left-0 right-0 p-4 flex items-start justify-between z-30 transition-opacity duration-300",
                isPlaying ? "opacity-0 group-hover:opacity-100" : "opacity-100"
              )}>
                {/* Status indicator */}
                <div className="flex items-center gap-2">
                  {isPlaying && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="w-1.5 h-1.5 rounded-full bg-gold-400"
                      />
                      <span className="text-xs font-medium text-white">Playing</span>
                    </motion.div>
                  )}
                </div>

                {/* Sound control */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleMute(reel.id)}
                  className="p-2.5 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-black/60 transition-all"
                  aria-label={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </motion.button>
              </div>

              {/* Pause button when playing */}
              {isPlaying && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handlePlayPause(reel.id)}
                  className="absolute inset-0 flex items-center justify-center z-20 opacity-0 hover:opacity-100 transition-opacity"
                >
                  <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center">
                    <Pause className="w-7 h-7 text-white" />
                  </div>
                </motion.button>
              )}

              {/* Outfit CTA */}
              {reel.outfit && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="absolute bottom-0 left-0 right-0 p-4 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300"
                >
                  <Link
                    href={`/outfit/${reel.outfit.slug}`}
                    className="block"
                  >
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-3 rounded-xl bg-white/95 backdrop-blur-md shadow-lg hover:bg-gold-50 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 pr-2">
                          <p className="text-sm font-medium text-charcoal-900 truncate">
                            {reel.outfit.title}
                          </p>
                          <p className="text-xs text-gold-600">
                            View Complete Outfit
                          </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-charcoal-600 flex-shrink-0" />
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              )}
            </div>

            {/* Reel title */}
            {reel.title && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="mt-4 px-1"
              >
                <p className="text-sm font-medium text-cream-100 truncate">
                  {reel.title}
                </p>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
