"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AudioRecorder from '@/components/AudioRecorder';
import AnimatedAlbumArts from '@/components/AnimatedAlbumArts';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAudioReady = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Support production deployments instead of hardcoded localhost
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      const res = await fetch(`${API_URL}/api/v1/recognize/`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to recognize track. Make sure the backend is running.");
      }

      const data = await res.json();
      
      if (data.message === "No match found") {
        setIsProcessing(false);
        setError("No match found. Try another clip.");
        return;
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('echosense_result', JSON.stringify({
          data
        }));
      }

      router.push('/result');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative overflow-hidden bg-background">
      <AnimatedAlbumArts />
      
      <div className="z-10 flex flex-col items-center justify-center w-full max-w-4xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h1 className="text-7xl font-black mb-4 tracking-tighter text-foreground">
            EchoSense
          </h1>
          <p className="text-2xl text-gray-500 font-light">
            Beautiful Music Intelligence
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {!isProcessing ? (
            <motion.div
              key="recorder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
            >
              <AudioRecorder onAudioReady={handleAudioReady} />
              {error && <p className="text-red-500 mt-6 bg-red-50 px-4 py-2 rounded-lg border border-red-100 shadow-sm">{error}</p>}
            </motion.div>
          ) : (
            <motion.div
              key="processing"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center gap-6"
            >
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-secondary border-l-accent animate-spin-slow opacity-60"></div>
                <div className="absolute inset-4 rounded-full border-4 border-secondary border-t-accent border-r-primary animate-spin-slow opacity-60" style={{ animationDirection: 'reverse', animationDuration: '3s' }}></div>
                <span className="text-2xl font-bold text-primary animate-pulse">...</span>
              </div>
              <h2 className="text-2xl font-bold text-foreground">Analyzing Audio...</h2>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
