import React, { useState, useRef, useEffect } from 'react';
import { SectionId } from '../types';

// Scramble Link (Desktop Only)
const NavLink = ({ item, onClick }: { item: string, onClick: () => void }) => {
    const [displayText, setDisplayText] = useState(item);
    const chars = 'X01/>_';
    const intervalRef = useRef<any>(null);

    const onMouseEnter = () => {
        let iteration = 0;
        clearInterval(intervalRef.current);
        intervalRef.current = setInterval(() => {
            setDisplayText(() =>
                item.split('')
                    .map((_, index) => {
                        if (index < iteration) return item[index];
                        return chars[Math.floor(Math.random() * chars.length)];
                    })
                    .join('')
            );
            if (iteration >= item.length) {
                clearInterval(intervalRef.current);
                setDisplayText(item);
            }
            iteration += 1 / 3;
        }, 30);
    };

    const onMouseLeave = () => {
        clearInterval(intervalRef.current);
        setDisplayText(item);
    };

    return (
        <button
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className="hidden md:block font-mono text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors relative group px-2 py-1"
        >
            <span className="relative z-10">{displayText}</span>
            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-black transition-all duration-300 ease-out group-hover:w-full"></span>
        </button>
    );
};

// --- CALM TOPOGRAPHIC LANDSCAPE (No Dizziness) ---
const MenuBackgroundCanvas = ({ active }: { active: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width;
            canvas.height = height;
        };
        resize();
        window.addEventListener('resize', resize);

        let offset = 0;
        let animId: number;

        const loop = () => {
            if (!active) {
                // requestAnimationFrame(loop); return; 
            }

            // Solid background
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#080808';
            ctx.fillRect(0, 0, width, height);

            ctx.lineWidth = 1;

            // Draw gentle rolling lines
            const lines = 20;
            const stepY = height / lines;

            offset += 0.005; // Very slow movement

            for (let i = 0; i < lines + 5; i++) {
                ctx.beginPath();
                const yBase = i * stepY;

                // Color fades at top and bottom
                const alpha = Math.max(0, 1 - Math.abs((i * stepY) - (height / 2)) / (height / 2));
                ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.15})`;

                for (let x = 0; x <= width; x += 20) {
                    // Perlin-ish noise using sine waves
                    const noise =
                        Math.sin(x * 0.002 + offset + i * 0.2) * 50 +
                        Math.cos(x * 0.005 - offset) * 20;

                    const y = yBase + noise;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Grid Dots
            ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
            for (let x = 0; x < width; x += 40) {
                for (let y = 0; y < height; y += 40) {
                    if (Math.random() > 0.995) {
                        ctx.fillRect(x, y, 2, 2);
                    }
                }
            }

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, [active]);

    return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

// --- DETAILED HUD OVERLAY ---
const HUDOverlay = () => (
    <div className="absolute inset-0 pointer-events-none z-20 p-6 flex flex-col justify-between">
        {/* Top Corners */}
        <div className="flex justify-between">
            <div className="w-8 h-8 border-t border-l border-white/30 relative">
                <div className="absolute top-0 left-0 w-2 h-2 bg-white/50"></div>
            </div>
            <div className="w-8 h-8 border-t border-r border-white/30 relative">
                <div className="absolute top-0 right-0 w-2 h-2 bg-white/50"></div>
            </div>
        </div>

        {/* Side Metadata */}
        <div className="absolute top-1/2 left-6 -translate-y-1/2 flex flex-col gap-8 text-[9px] font-mono text-white/30 hidden md:flex">
            <span className="-rotate-90">SYS_NAV</span>
            <span className="-rotate-90">V.4.0.1</span>
        </div>
        <div className="absolute top-1/2 right-6 -translate-y-1/2 flex flex-col gap-4 text-[9px] font-mono text-white/30 text-right hidden md:flex">
            <span>COORD: {Math.random().toFixed(4)}</span>
            <span>SYNC: STABLE</span>
        </div>

        {/* Bottom Corners */}
        <div className="flex justify-between items-end">
            <div className="w-8 h-8 border-b border-l border-white/30 relative">
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-white/50"></div>
            </div>

            {/* Center Bottom Decoration */}
            <div className="flex flex-col items-center gap-1 opacity-50">
                <div className="flex gap-1">
                    <div className="w-1 h-3 bg-white/20"></div>
                    <div className="w-1 h-3 bg-white/40"></div>
                    <div className="w-1 h-3 bg-white/20"></div>
                </div>
            </div>

            <div className="w-8 h-8 border-b border-r border-white/30 relative">
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-white/50"></div>
            </div>
        </div>
    </div>
);

// --- MOBILE HUD MENU ---
const MobileHUD = ({ isOpen, onClose, onNavigate, onOpenTerminal }: { isOpen: boolean, onClose: () => void, onNavigate: (id: string) => void, onOpenTerminal: () => void }) => {

    const [visible, setVisible] = useState(false);
    useEffect(() => {
        if (isOpen) setTimeout(() => setVisible(true), 300);
        else setVisible(false);
    }, [isOpen]);

    const menuItems = [
        { id: 'hero', label: 'Home', num: '01' },
        { id: 'about', label: 'Profile', num: '02' },
        { id: 'projects', label: 'Work', num: '03' },
        { id: 'process', label: 'Method', num: '04' },
        { id: 'contact', label: 'Connect', num: '05' },
        { id: 'terminal', label: 'Terminal', num: '06' }
    ];

    return (
        <div
            className={`fixed inset-0 z-[200] flex flex-col transition-all duration-700 ease-[cubic-bezier(0.87,0,0.13,1)] bg-black ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
            {/* BACKGROUND */}
            <MenuBackgroundCanvas active={isOpen} />

            {/* DETAIL OVERLAY */}
            <HUDOverlay />

            {/* HEADER - CENTERED */}
            <div className={`absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 transition-all duration-500 delay-100 ${isOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}`}>
                <div className="w-8"></div> {/* Spacer for balance */}
                <div className="flex items-center gap-2">
                    <span className="text-white font-bold tracking-tight text-lg">AKASH AIBATOLLA</span>
                </div>
                <button onClick={onClose} className="p-2 text-white hover:rotate-90 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* LIST */}
            <div className="flex-1 flex flex-col justify-center items-center z-30 gap-6">
                {menuItems.map((item, idx) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            if (item.id === 'terminal') onOpenTerminal();
                            else onNavigate(item.id);
                            onClose();
                        }}
                        className={`
                            relative group flex items-baseline gap-4 transition-all duration-700 w-full max-w-xs md:max-w-md mx-auto
                            ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
                        `}
                        style={{ transitionDelay: `${idx * 50}ms` }}
                    >
                        <span className="font-mono text-xs text-white/30 group-hover:text-white/60 transition-colors">/{item.num}</span>

                        {/* TEXT */}
                        <span className="relative z-20 block text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-white/80 to-white/40 group-hover:to-white transition-all tracking-tight cursor-pointer">
                            {item.label}
                        </span>

                        {/* Hover Arrow */}
                        <span className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 text-white">
                            →
                        </span>
                    </button>
                ))}
            </div>

            {/* FOOTER */}
            <div className={`absolute bottom-8 w-full text-center z-50 transition-all duration-500 delay-300 ${isOpen ? 'opacity-50 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p className="text-[10px] text-white uppercase tracking-[0.3em]">System Architect Portfolio</p>
                <p className="text-[8px] text-zinc-500 font-mono mt-2">SECURE CONNECTION ESTABLISHED</p>
            </div>
        </div>
    );
};

export const Navigation: React.FC<{ onOpenTerminal: () => void }> = ({ onOpenTerminal }) => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <>
            <nav className="absolute top-0 left-0 w-full z-[100] py-6 text-zinc-900 pointer-events-none">
                <div className="max-w-7xl mx-auto px-6 relative flex justify-between items-center h-12">

                    {/* LEFT: Nav Links (Desktop) */}
                    <div className="hidden md:flex items-center gap-6 pointer-events-auto">
                        {['about', 'projects', 'lab', 'process'].map((item) => (
                            <NavLink key={item} item={item} onClick={() => scrollTo(item)} />
                        ))}
                    </div>

                    {/* LEFT: Mobile Menu Button (Mobile Only) */}
                    <div className="flex md:hidden items-center pointer-events-auto">
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="p-2 text-black border border-black rounded hover:bg-black hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        </button>
                    </div>

                    {/* CENTER: BRAND */}
                    <div
                        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 group cursor-pointer flex flex-col items-center pointer-events-auto"
                        onClick={() => scrollTo(SectionId.HERO)}
                    >
                        <div className="relative">
                            <span className="font-bold tracking-tighter text-xl md:text-2xl group-hover:text-zinc-600 transition-colors whitespace-nowrap uppercase">Akash Aibatolla</span>
                            <div className="absolute -top-1 -right-2 w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.5)]"></div>
                        </div>
                        <span className="text-[9px] font-mono tracking-widest uppercase leading-none text-zinc-400 group-hover:text-black mt-1">System_Architect</span>
                    </div>

                    {/* RIGHT: Actions (Desktop) */}
                    <div className="hidden md:flex items-center gap-4 pointer-events-auto">
                        <button
                            onClick={onOpenTerminal}
                            className="flex items-center justify-center w-9 h-9 rounded border border-zinc-300 bg-zinc-50 hover:bg-black hover:text-white hover:border-black transition-all duration-300 group shadow-sm relative overflow-hidden"
                            title="Open Terminal"
                        >
                            <span className="font-mono text-xs font-bold relative z-10">{'>_'}</span>
                            <span className="absolute inset-0 bg-blue-500/10 animate-pulse"></span>
                        </button>

                        <button
                            onClick={() => scrollTo(SectionId.CONTACT)}
                            className="relative overflow-hidden bg-black text-white px-5 py-2 rounded-full font-mono text-xs font-bold uppercase tracking-widest group transition-all hover:scale-105 shadow-lg hover:shadow-xl"
                        >
                            <span className="relative z-10 group-hover:text-white transition-colors duration-300">Connect</span>
                            <div className="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
                        </button>
                    </div>

                    {/* RIGHT: Mobile Terminal Button */}
                    <div className="flex md:hidden items-center pointer-events-auto">
                        <button
                            onClick={onOpenTerminal}
                            className="w-9 h-9 flex items-center justify-center rounded border border-zinc-300 bg-white"
                        >
                            <span className="font-mono text-xs font-bold">{'>_'}</span>
                        </button>
                    </div>

                </div>
            </nav>

            {/* HUD Overlay */}
            <MobileHUD
                isOpen={isMobileMenuOpen}
                onClose={() => setIsMobileMenuOpen(false)}
                onNavigate={scrollTo}
                onOpenTerminal={onOpenTerminal}
            />
        </>
    );
};