import React, { useEffect, useRef, useState } from 'react';
import { SectionId } from '../types';

// Subtle Text Interaction for Process Terms (Highlighter Style)
const ProcessHighlight = ({ children }: { children: React.ReactNode }) => (
  <span className="group relative inline-block px-1 cursor-default">
    {/* Animated Highlight Background */}
    <span className="absolute inset-0 bg-blue-100/50 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left -rotate-1 rounded"></span>

    {/* Text */}
    <span className="relative z-10 font-bold text-zinc-800 transition-all duration-300 group-hover:text-blue-600 group-hover:scale-105 inline-block">
      {children}
    </span>
  </span>
);

export const Process: React.FC = () => {
  // SIMPLIFIED STEPS (No Jargon)
  const steps = [
    {
      num: '01',
      title: 'Discovery & Goals',
      desc: <>Before writing code, I define the <ProcessHighlight>failure points</ProcessHighlight>. I ask the hard questions: What happens if the server crashes? How many users can we handle? We set clear goals for speed and reliability.</>
    },
    {
      num: '02',
      title: 'Solid Blueprinting',
      desc: <>I map out the entire <ProcessHighlight>system architecture</ProcessHighlight> first. Just like a building, if the foundation is weak, the structure falls. I ensure every part of the system is loosely coupled, so one error doesn't break everything.</>
    },
    {
      num: '03',
      title: 'Resilient Building',
      desc: <>I build with a focus on <ProcessHighlight>Happy Paths</ProcessHighlight> last. I prioritize error handling and data safety from Day 1. This ensures that when network issues happen (and they will), your data remains safe and consistent.</>
    },
    {
      num: '04',
      title: 'Launch & Monitor',
      desc: <>A system is only good if you know how it's performing. I set up detailed <ProcessHighlight>monitoring dashboards</ProcessHighlight> so we can see issues before your users do. We test the limits to ensure it scales as you grow.</>
    },
  ];

  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // 1. Scroll Progress Logic
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const height = rect.height;
      const windowHeight = window.innerHeight;

      // Calculate percentage of section scrolled
      const offset = windowHeight * 0.4;
      const start = rect.top - offset;
      const end = height - windowHeight * 0.5;

      let pct = (start * -1) / end;
      pct = Math.max(0, Math.min(1, pct));

      setProgress(pct * 1.2);
    };
    window.addEventListener('scroll', handleScroll);

    // 2. Reveal Animation Logic
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, { threshold: 0.1 });

    if (sectionRef.current) {
      const elements = sectionRef.current.querySelectorAll('.reveal-blur');
      elements.forEach(el => observer.observe(el));
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* TOP SEPARATOR */}
      <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-b border-white/10">
        <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
          {Array(10).fill("AGILE OPS // FLOW STATE // ").map((t, i) => (
            <span key={i} className="opacity-80">{t}</span>
          ))}
        </div>
      </div>

      <section id={SectionId.PROCESS} ref={sectionRef} className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">

            {/* Sticky Header */}
            <div className="md:sticky md:top-32 mb-12 md:mb-0 reveal-blur">
              <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest block mb-4">(05) Method</span>
              <h2 className="text-5xl font-bold text-black mb-8 tracking-tighter leading-[0.9]">
                How I<br />Work
              </h2>
              <p className="text-zinc-500 font-light text-lg leading-relaxed max-w-md">
                Complexity requires discipline. My process eliminates ambiguity through careful planning. I treat <ProcessHighlight>documentation</ProcessHighlight> as a product, ensuring the system is predictable, easy to maintain, and resilient long after I'm gone.
              </p>

              <div className="mt-12 p-6 bg-zinc-50 border border-zinc-100 rounded-lg max-w-sm hidden md:block group hover:border-black/20 transition-colors relative overflow-hidden reveal-blur delay-200">
                <div className="inline-flex items-center gap-2 mb-2 bg-white border border-zinc-200 px-3 py-1 rounded-full relative overflow-hidden">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                  <p className="font-bold text-[10px] uppercase tracking-wider relative z-10">Core Philosophy</p>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-100/30 to-transparent w-[200%] animate-shimmer"></div>
                </div>
                <p className="text-sm italic text-zinc-600 mt-2">"Everything fails, all the time."</p>
                <p className="text-xs text-zinc-400 mt-2">— Werner Vogels</p>
                <div className="h-0.5 w-0 group-hover:w-full bg-black mt-4 transition-all duration-700"></div>
              </div>
            </div>

            {/* Steps Column */}
            <div className="relative pl-8 border-l border-zinc-100">
              {/* Animated Progress Line */}
              <div
                className="absolute top-0 left-[-1px] w-[2px] bg-black transition-all duration-100 ease-linear shadow-[0_0_15px_rgba(0,0,0,0.3)]"
                style={{ height: `${Math.min(progress * 100, 100)}%` }}
              />

              <div className="space-y-0">
                {steps.map((step, idx) => {
                  const stepStart = idx / steps.length;
                  const stepEnd = (idx + 1) / steps.length;
                  const isCurrent = progress >= stepStart && progress < stepEnd;

                  return (
                    <div
                      key={step.num}
                      className="group relative py-16 pr-4 reveal-blur"
                    >
                      <div className={`font-mono text-sm font-bold mb-4 transition-colors duration-300 ${isCurrent ? 'text-black' : 'text-zinc-300'}`}>
                        {step.num}
                      </div>
                      <div>
                        <h3 className={`text-2xl md:text-3xl font-bold mb-4 transition-colors duration-300 ${isCurrent ? 'text-black' : 'text-zinc-800'}`}>
                          {step.title}
                        </h3>
                        <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-lg">
                          {step.desc}
                        </p>
                      </div>

                      {/* ANIMATED SEPARATOR */}
                      {idx !== steps.length - 1 && (
                        <div className="absolute bottom-0 left-0 w-full flex justify-center">
                          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-300 to-transparent transform scale-x-0 group-[.active]:scale-x-100 transition-transform duration-1000 ease-out origin-center delay-300"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BOTTOM SEPARATOR - NEW */}
      <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-white/20">
        <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
          {Array(10).fill("READY FOR LAUNCH // INITIALIZE CONTACT // ").map((t, i) => (
            <span key={i} className="opacity-80 text-white">{t}</span>
          ))}
        </div>
      </div>
    </>
  );
};