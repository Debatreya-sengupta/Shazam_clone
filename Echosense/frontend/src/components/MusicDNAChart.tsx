"use client";

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface DNAProps {
  data: {
    energy: number;
    danceability: number;
    bpm: number;
    spectral_centroid?: number;
    spectral_rolloff?: number;
  };
}

export default function MusicDNAChart({ data }: DNAProps) {
  // Normalize data for 0-100 scale on radar
  const chartData = [
    { subject: 'Energy', A: data.energy * 100, fullMark: 100 },
    { subject: 'Dance', A: data.danceability * 100, fullMark: 100 },
    { subject: 'Tempo', A: Math.min((data.bpm / 200) * 100, 100), fullMark: 100 },
    { subject: 'Vocals', A: Math.min(((data.spectral_centroid || 1000) / 4000) * 100, 100), fullMark: 100 },
    { subject: 'Bass', A: Math.max(100 - (((data.spectral_rolloff || 2000) / 8000) * 100), 0), fullMark: 100 }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="w-full h-[320px] glass p-4 flex flex-col"
    >
      <h3 className="text-lg font-bold text-foreground mb-2 text-center">Music DNA</h3>
      <div className="w-full flex-1 min-h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="rgba(128,128,128,0.4)" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(128,128,128,0.9)', fontSize: 13, fontWeight: 600 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar name="Song" dataKey="A" stroke="#fa243c" strokeWidth={3} fill="#fa243c" fillOpacity={0.25} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
