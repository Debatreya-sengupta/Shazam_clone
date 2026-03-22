"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import SongCard from '@/components/SongCard';
import MusicDNAChart from '@/components/MusicDNAChart';
import RecommendationList from '@/components/RecommendationList';
import AnalyticsPanel from '@/components/AnalyticsPanel';

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const dataStr = sessionStorage.getItem('echosense_result');
    if (!dataStr) {
      router.push('/');
      return;
    }
    try {
      setResult(JSON.parse(dataStr).data);
    } catch (e) {
      router.push('/');
    }
  }, [router]);

  if (!result) return null;

  return (
    <div className="pb-20 min-h-screen relative overflow-hidden bg-background">
      <div className="max-w-7xl mx-auto px-4 pt-8 z-10 relative">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-foreground transition-colors mb-8"
        >
          <ChevronLeft size={20} />
          Back to Scanner
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Identity & Highlights */}
          <div className="col-span-1 flex flex-col gap-6">
            <SongCard song={result.song} />
            <div className="glass p-6 text-center relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-secondary/40 to-primary/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
               <h3 className="text-lg font-semibold text-foreground mb-2 relative z-10">Dominant Vibe</h3>
               <p className="text-5xl font-black capitalize text-primary relative z-10 transition-transform duration-300 group-hover:scale-110">
                 {result.analysis?.mood || "Neutral"}
               </p>
            </div>
            <div className="glass p-6 text-center">
               <h3 className="text-lg font-semibold text-foreground mb-2">Detected Tempo</h3>
               <p className="text-4xl font-black text-secondary">
                 {result.analysis?.bpm || "--"}
                 <span className="text-sm text-gray-400 ml-2 font-normal">BPM</span>
               </p>
            </div>
          </div>

          {/* Right Column: Deep Analysis */}
          <div className="col-span-1 lg:col-span-2 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MusicDNAChart data={result.analysis} />
              <AnalyticsPanel data={result.analysis} />
            </div>

            <RecommendationList recommendations={result.recommendations} />
          </div>
        </div>
      </div>
    </div>
  );
}
