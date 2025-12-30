import React, { useEffect, useRef, useState } from 'react';
import { SectionId } from '../types';

export const Contact: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (e.clientY >= rect.top && e.clientY <= rect.bottom) {
        setMouse({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height
        });
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section id={SectionId.CONTACT} ref={sectionRef} className="py-40 bg-black text-white relative overflow-hidden">
      {/* Moving Glow */}
      <div
        className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-blue-900/40 rounded-full blur-[120px] pointer-events-none transition-transform duration-100 ease-out will-change-transform"
        style={{
          transform: `translate(-50%, -50%) translate(${(mouse.x - 0.5) * 100}px, ${(mouse.y - 0.5) * 100}px)`,
        }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 mb-8 bg-zinc-900/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_#22c55e]"></span>
          <span className="font-mono text-xs text-zinc-300 uppercase tracking-widest">Status: Available</span>
        </div>

        <h2 className="text-6xl md:text-9xl font-bold tracking-tighter mb-12 mix-blend-difference"
          style={{
            transform: `translate(${(mouse.x - 0.5) * 20}px, ${(mouse.y - 0.5) * 20}px)`,
            transition: 'transform 0.1s ease-out'
          }}
        >
          LET'S BUILD<br />
          <span className="text-zinc-600">THE FUTURE.</span>
        </h2>

        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          <a
            href="mailto:hello@example.com"
            className="group relative px-10 py-5 bg-white text-black font-bold tracking-wider rounded-full overflow-hidden hover:scale-105 transition-transform duration-300"
          >
            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Start Project</span>
            <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
          </a>
          <button
            onClick={() => document.getElementById('ai-chat-trigger')?.click()}
            className="relative overflow-hidden px-10 py-5 border border-white/20 text-white font-mono text-sm hover:bg-white/10 transition-colors rounded-full backdrop-blur-sm group"
          >
            <span className="relative z-10">Ask AI Assistant</span>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>
          </button>
        </div>

        <div className="mt-32 flex justify-center gap-12 font-mono text-xs text-zinc-500">
          <a href="#" className="hover:text-white transition-colors transform hover:-translate-y-1 duration-200">GITHUB</a>
          <a href="#" className="hover:text-white transition-colors transform hover:-translate-y-1 duration-200">LINKEDIN</a>
          <a href="#" className="hover:text-white transition-colors transform hover:-translate-y-1 duration-200">TWITTER</a>
        </div>
      </div>
    </section>
  );
};