"use client";

import { motion } from 'framer-motion';

export default function RecommendationList({ recommendations }: { recommendations: any[] }) {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full mt-4"
    >
      <h3 className="text-xl font-bold mb-4 text-foreground">Similar Tracks</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
        {recommendations.map((rec, i) => {
          const youtubeFallbackUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(rec.title + ' ' + rec.artist)}`;
          const url = rec.itunes_url || youtubeFallbackUrl;
          const isApple = !!rec.itunes_url;
          
          // Upscale image resolution if from iTunes
          const highResArtwork = rec.artwork && rec.artwork.includes('100x100bb') 
            ? rec.artwork.replace('100x100bb', '400x400bb') 
            : rec.artwork;

          return (
            <a key={i} href={url} target="_blank" rel="noopener noreferrer">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="min-w-[200px] max-w-[200px] glass p-4 flex flex-col gap-2 flex-shrink-0 cursor-pointer h-full relative"
              >
                {/* Platform Icon floating badge */}
                <div className="absolute top-6 right-6 z-20 shadow-md rounded-full bg-white dark:bg-black p-1">
                  {isApple ? (
                    <svg viewBox="0 0 384 512" width="16" height="16" className="fill-primary"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.3 47.1-.8 81.6-91.5 95.2-132.8-44.5-19.1-54.8-56.1-54.3-77.8zM242.4 92.8c21.4-27.4 34.6-60.6 28.5-92.8-29.2 1.8-63.5 20.7-85.1 47.6-19.6 24.5-34.6 57.9-29.4 89.2 32.5 3.3 62.9-18.7 86-44z"/></svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" className="fill-[#FF0000]"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                  )}
                </div>

                <div className="h-40 w-full rounded-lg mb-2 relative overflow-hidden group border border-gray-200 dark:border-zinc-800">
                  {highResArtwork ? (
                    <img src={highResArtwork} alt={rec.title} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-gray-50 dark:bg-zinc-800 flex flex-col items-center justify-center text-gray-400 text-xs">
                      <span className="font-bold text-gray-500">{rec.mood || "vibe"}</span>
                      <span>{rec.bpm || "??"} BPM</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-white/60 dark:bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center p-2 text-center backdrop-blur-sm">
                    <span className="font-bold text-sm text-primary capitalize">{rec.mood || "vibe"}</span>
                    <span className="text-xs text-foreground mt-1 font-semibold">{rec.bpm || "??"} BPM</span>
                  </div>
                </div>
                <h4 className="font-bold text-foreground truncate">{rec.title}</h4>
                <p className="text-sm text-gray-500 truncate">{rec.artist}</p>
              </motion.div>
            </a>
          );
        })}
      </div>
    </motion.div>
  );
}
