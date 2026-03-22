"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AudioRecorder({ onAudioReady }: { onAudioReady: (file: File) => void }) {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Setup audio analyzer for spectrogram
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      drawSpectrogram();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const file = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
        onAudioReady(file);
        
        // Stop audio tracks & context
        stream.getTracks().forEach(track => track.stop());
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        // clear canvas
        const canvas = canvasRef.current;
        if (canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Microphone access is required to identify songs.");
    }
  };

  const drawSpectrogram = () => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barsToDraw = 48; // a nice wide wave
      const barWidth = 4;
      const gap = 4;
      let barHeight;
      
      // Calculate true centered X start position
      let x = (canvas.width - (barsToDraw * (barWidth + gap))) / 2;
      if (x < 0) x = 0;
      
      const centerY = canvas.height / 2;
      ctx.lineCap = 'round';
      ctx.lineWidth = barWidth;

      const step = Math.floor((bufferLength * 0.5) / (barsToDraw / 2)); 
      // We use only the lower half of frequencies for better voice visualization
      const halfBars = Math.floor(barsToDraw / 2);

      for (let i = 0; i < barsToDraw; i++) {
        // Mirrored index so that center is 0 (bass/loudest) and edges are higher frequencies
        const mirrorIndex = Math.abs(i - halfBars);
        const dataIndex = mirrorIndex * step;

        // Apply a multiplier to make the bulge look very natural (tapers off heavily at edges)
        const edgeTaper = 1 - (mirrorIndex / halfBars) * 0.5;

        barHeight = (dataArray[dataIndex] / 255) * (canvas.height * 0.8) * edgeTaper;
        if (barHeight < 4) barHeight = 4; // min height
        
        ctx.strokeStyle = `rgba(250, 36, 60, ${0.4 + (barHeight/150)})`; // Apple music red
        
        ctx.beginPath();
        ctx.moveTo(x, centerY - barHeight / 2);
        ctx.lineTo(x, centerY + barHeight / 2);
        ctx.stroke();

        x += barWidth + gap;
      }
    };

    draw();
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAudioReady(e.target.files[0]);
    }
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current) audioContextRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={isRecording ? stopRecording : startRecording}
          className={cn(
            "relative flex items-center justify-center w-32 h-32 rounded-full transition-all duration-300 z-10 shadow-lg border",
            isRecording 
              ? "bg-primary text-white shadow-primary/30 border-transparent animate-pulse" 
              : "bg-white text-primary border-gray-100 hover:shadow-xl shadow-gray-200/50 dark:bg-zinc-900 dark:border-zinc-800 dark:shadow-black/50"
          )}
        >
          {isRecording ? <Square size={36} fill="currentColor" /> : <Mic size={48} />}
        </motion.button>
      </div>
      
      <div className="text-center z-10">
        <h2 className="text-2xl font-semibold mb-2 text-foreground">
          {isRecording ? "Listening..." : "Tap to Identify"}
        </h2>
        <p className="text-gray-400 dark:text-gray-500 mb-6 font-light">or</p>
        
        <label className="cursor-pointer inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white dark:bg-zinc-900 shadow-sm border border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors text-foreground font-medium">
          <Upload size={18} className="text-primary" />
          <span className="text-sm">Upload Audio File</span>
          <input type="file" accept="audio/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className={cn(
        "w-full h-32 mt-4 flex items-center justify-center transition-all duration-500 z-10",
        isRecording ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none h-0"
      )}>
        <canvas
          ref={canvasRef}
          width={600}
          height={120}
          className="max-w-full h-full"
        />
      </div>
    </div>
  );
}
