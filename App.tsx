import React, { useState, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Navigation } from './components/Navigation';
import { About } from './components/About';
import { Philosophy } from './components/Philosophy';
import { Projects } from './components/Projects';
import { Lab } from './components/Lab';
import { Skills } from './components/Skills';
import { Process } from './components/Process';
import { Contact } from './components/Contact';
import { AIChat } from './components/AIChat';
import { CustomCursor } from './components/CustomCursor';
import { CommandTerminal } from './components/CommandTerminal';
import { Telemetry } from './components/Telemetry';
import { BootSequence } from './components/BootSequence';

const App: React.FC = () => {
  const [isBooted, setIsBooted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  useEffect(() => {
    if (isBooted) {
      // Quick fade in after boot
      const timer = setTimeout(() => setIsLoaded(true), 100);
      return () => clearTimeout(timer);
    }
  }, [isBooted]);

  // Render Boot Sequence first
  if (!isBooted) {
    return <BootSequence onComplete={() => setIsBooted(true)} />;
  }

  return (
    <div className={`min-h-screen relative bg-[#f4f4f5] transition-opacity duration-1000 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <CustomCursor />
      <Navigation onOpenTerminal={() => setIsTerminalOpen(true)} />

      <main className="relative z-10">
        <Hero />
        <About />
        <Philosophy />
        <Telemetry />
        <Projects />
        <Lab />
        <Skills />
        <Process />
        <Contact />
      </main>

      <footer className="py-12 text-center text-zinc-400 text-xs font-mono border-t border-zinc-200 bg-[#f4f4f5]">
        <div className="flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-full">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] tracking-widest uppercase text-zinc-500">System Online</span>
          </div>
          <p className="mt-2 tracking-widest uppercase">System Architect // Portfolio</p>
          <p className="opacity-50">Deployed {new Date().getFullYear()}</p>
        </div>
      </footer>

      <AIChat />
      <CommandTerminal isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
    </div>
  );
};

export default App;