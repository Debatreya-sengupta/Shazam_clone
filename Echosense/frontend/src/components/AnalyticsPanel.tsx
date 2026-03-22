"use client";

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AnalyticsPanel({ data }: { data: any }) {
  if (!data) return null;

  // We mocked static analysis data in backend so we'll visualize its static properties as bars 
  // or a small trend mock for the sake of the dashboard feel.
  
  const mockTrendData = [
    { time: '0s', value: data.energy * 50 },
    { time: '30s', value: data.energy * 100 },
    { time: '60s', value: data.danceability * 80 },
    { time: '90s', value: data.energy * 120 },
    { time: '120s', value: data.energy * 90 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.4 }}
      className="w-full glass p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-foreground">Energy Flow</h3>
        <div className="px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold capitalize shadow-sm">
          {data.mood} ⚡
        </div>
      </div>
      
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockTrendData}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fa243c" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#fa243c" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="rgba(0,0,0,0.2)" fontSize={12} tickLine={false} axisLine={false} tick={{fill: '#86868b'}} />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#fa243c', fontWeight: 'bold' }}
              cursor={{ stroke: 'rgba(0,0,0,0.1)', strokeWidth: 1 }}
            />
            <Area type="monotone" dataKey="value" stroke="#fa243c" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
