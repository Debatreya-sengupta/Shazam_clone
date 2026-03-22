"use client";

import { motion } from 'framer-motion';
import { Disc } from 'lucide-react';

export default function SongCard({ song }: { song: any }) {
  if (!song) return null;

  const confidencePct = Math.round(song.confidence * 100);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 w-full relative overflow-hidden flex flex-col items-center justify-center text-center"
    >
      <div className="absolute top-4 right-4 text-xs font-bold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
        {confidencePct}% Match
      </div>
      
      {/* Rotating Disc Animation */}
      <div className="w-40 h-40 rounded-full overflow-hidden bg-gray-900 border-4 border-gray-800 shadow-xl flex items-center justify-center mb-6 animate-spin-slow relative">
        {/* Record Grooves */}
        <div className="absolute inset-2 border border-white/5 rounded-full"></div>
        <div className="absolute inset-5 border border-white/5 rounded-full"></div>
        <div className="absolute inset-8 border border-white/5 rounded-full"></div>
        
        {/* Record Label */}
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center relative shadow-inner">
          <div className="w-4 h-4 bg-gray-100 rounded-full border border-gray-300"></div>
        </div>
      </div>

      <h2 className="text-3xl font-extrabold mb-1 text-foreground">{song.title}</h2>
      <p className="text-xl text-gray-500 font-light">{song.artist}</p>
    </motion.div>
  );
}
