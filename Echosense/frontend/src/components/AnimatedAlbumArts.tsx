"use client";

import { useEffect, useState } from 'react';

export default function AnimatedAlbumArts() {
  const [albums, setAlbums] = useState<string[]>([]);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const artists = [
          'taylor swift', 'the weeknd', 'drake', 'billie eilish', 
          'bad bunny', 'ariana grande', 'ed sheeran', 'post malone',
          'dua lipa', 'bruno mars'
        ];
        const artist = artists[Math.floor(Math.random() * artists.length)];
        const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=album&limit=25`);
        const data = await res.json();
        if (data.results) {
          const arts = data.results.map((r: any) => r.artworkUrl100.replace('100x100bb', '400x400bb'));
          // Duplicate items to ensure enough content for seamless scrolling
          setAlbums([...arts, ...arts]);
        }
      } catch (e) {
        console.error("Failed to fetch album arts", e);
      }
    };
    fetchAlbums();
  }, []);

  if (albums.length === 0) return null;

  const half = Math.floor(albums.length / 2);
  const row1 = albums.slice(0, half);
  const row2 = albums.slice(half);

  return (
    <>
      <style>{`
        @keyframes scroll-left {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
        @keyframes scroll-right {
          0% { transform: translate3d(-50%, 0, 0); }
          100% { transform: translate3d(0, 0, 0); }
        }
        .animate-scroll-left {
          animation: scroll-left 90s linear infinite;
          will-change: transform;
        }
        .animate-scroll-right {
          animation: scroll-right 100s linear infinite;
          will-change: transform;
        }
      `}</style>

      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-[0.10] md:opacity-[0.15] dark:opacity-20 z-0">
        
        {/* Top row scrolling right to left */}
        <div className="absolute top-[5%] left-0 w-[300vw] flex gap-8">
          <div className="flex gap-8 animate-scroll-left">
            {[...row1, ...row1].map((art, i) => (
              <div key={i} className="w-56 h-56 md:w-64 md:h-64 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0">
                <img src={art} alt="" className="w-full h-full object-cover rounded-3xl" />
              </div>
            ))}
          </div>
        </div>

        {/* Bottom row scrolling left to right */}
        <div className="absolute top-[55%] -left-[100vw] w-[300vw] flex gap-8">
          <div className="flex gap-8 animate-scroll-right">
            {[...row2, ...row2].map((art, i) => (
              <div key={`bottom-${i}`} className="w-64 h-64 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-2xl flex-shrink-0">
                <img src={art} alt="" className="w-full h-full object-cover rounded-3xl" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
