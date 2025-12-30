import React, { useEffect, useRef } from 'react';
import { SectionId } from '../types';

// --- VISUALIZATION: SIGNAL WAVEFORM ---
const SignalWaveform: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        const dpr = window.devicePixelRatio || 1;

        const resize = () => {
            width = canvas.offsetWidth;
            height = canvas.offsetHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', resize);
        resize();

        let time = 0;

        const render = () => {
            ctx.clearRect(0, 0, width, height);
            time += 0.05;

            ctx.lineWidth = 1.5;
            const lines = 6;
            const baseAmp = 35;

            // Auto-movement logic
            const activeX = width * 0.5;

            for (let l = 0; l < lines; l++) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 0, 0, ${1 - (l / lines)})`;

                for (let x = 0; x < width; x += 5) {
                    const dx = x - activeX;

                    // Always active wave
                    const interactionRadius = 200;
                    const localAmp = Math.max(0, interactionRadius - Math.abs(dx) * 0.5);

                    const y = (height / 2) +
                        Math.sin(x * 0.02 + time + (l * 0.3)) * baseAmp +
                        Math.cos(x * 0.05 - time * 2) * 5 +
                        (Math.sin(x * 0.1 + time * 5) * (localAmp * 0.3));

                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-[320px] bg-white cursor-crosshair touch-none" />;
};

// --- INTERACTIVE TEXT COMPONENT (Strict Bounds) ---
const InteractiveText = ({ children }: { children: React.ReactNode }) => (
    <span className="group relative inline-block cursor-help whitespace-nowrap mx-1 align-baseline">
        {/* Background Highlight - Strictly confined, no scaling out */}
        <span className="absolute inset-0 bg-blue-50 w-full transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 -z-10 rounded-sm"></span>

        {/* Text */}
        <span className="relative z-10 font-bold text-zinc-900 transition-colors duration-300 group-hover:text-blue-600">
            {children}
        </span>

        {/* Bottom Line */}
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-zinc-200 transition-opacity duration-300 group-hover:opacity-0"></span>
        <span className="absolute bottom-0 left-0 w-full h-[2px] bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></span>
    </span>
);

// 3D Card with Benefit-First Text
const TechCard = ({
    title,
    description,
    onClick,
    className
}: {
    title: string,
    description: string,
    onClick?: () => void,
    className?: string
}) => {
    return (
        <div
            onClick={onClick}
            className={`
                group relative p-8 rounded-xl transition-all duration-500 ease-out cursor-pointer
                border h-[320px] w-[280px] flex flex-col justify-center flex-shrink-0
                bg-zinc-50 border-zinc-200 
                hover:bg-white hover:border-transparent
                md:hover:-translate-y-3 md:hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.15)]
                active:scale-95 md:active:scale-100
                ${className}
            `}
        >
            <div className="flex flex-col relative z-10 gap-5">
                <div className="flex justify-between items-center w-full">
                    <span className="font-mono text-base font-bold text-zinc-900 group-hover:text-blue-600 transition-colors">
                        {title}
                    </span>
                    <div className="w-1.5 h-1.5 bg-zinc-300 group-hover:bg-blue-500 rounded-full transition-colors group-hover:scale-150"></div>
                </div>
                <div className="h-px w-8 bg-zinc-200 group-hover:w-full group-hover:bg-blue-100 transition-all duration-500"></div>
                <p className="text-sm leading-relaxed text-zinc-500 group-hover:text-zinc-800 transition-colors">
                    {description}
                </p>
            </div>
        </div>
    );
};

export const About: React.FC = () => {
    const sectionRef = useRef<HTMLElement>(null);

    // Scroll Reveal Logic
    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.15 });

        if (sectionRef.current) {
            const elements = sectionRef.current.querySelectorAll('.reveal-blur');
            elements.forEach(el => observer.observe(el));
        }

        return () => observer.disconnect();
    }, []);

    const topSkills = [
        { title: "Auto-Scaling", description: "Systems that automatically grow when traffic spikes, so your app never crashes under pressure." },
        { title: "Mobile Ops", description: "Monitor, restart, and scale your servers directly from a text message or mobile app." },
        { title: "Real-Time Sync", description: "Instant data updates. When one user clicks, everyone else sees it immediately. Zero delay." },
        { title: "Bank Security", description: "Fortress-level encryption and safety protocols. I keep your customer data locked down tight." },
        { title: "Self-Healing", description: "My code detects its own errors and fixes them automatically, ensuring reliability while you sleep." }
    ];

    // Removed duplication for infinite scroll since we are now doing manual scroll
    const scrollSkills = [...topSkills];

    return (
        <>
            {/* SEPARATOR */}
            <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-b border-white/10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
                    {Array(10).fill("SYSTEM ARCHITECT // DISTRIBUTED SYSTEMS // ").map((t, i) => (
                        <span key={i} className="opacity-80">{t}</span>
                    ))}
                </div>
            </div>

            <section id={SectionId.ABOUT} ref={sectionRef} className="py-24 md:py-32 bg-white relative overflow-hidden">

                <div className="max-w-7xl mx-auto px-6 relative z-10">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-16 pt-8 md:pt-16">

                        {/* Left Column */}
                        <div className="md:col-span-4 sticky top-32 self-start">
                            <div className="reveal-blur delay-100">
                                <span className="font-mono text-xs text-zinc-400 uppercase tracking-widest block mb-4">(01) Profile</span>

                                <h2 className="text-5xl md:text-6xl font-bold tracking-tighter text-black mb-6 leading-[0.9] group cursor-default">
                                    THE<br />ARCHITECT<br />
                                    <span className="text-zinc-300">CORE</span>
                                </h2>

                                {/* VISUAL - SIGNAL WAVEFORM */}
                                <div className="relative w-full border border-zinc-100 bg-white rounded-xl overflow-hidden mb-8 shadow-sm group">
                                    <SignalWaveform />
                                    <div className="absolute bottom-4 left-4 font-mono text-[9px] text-zinc-400 bg-white/90 backdrop-blur px-2 py-1 rounded border border-zinc-200 pointer-events-none">
                                        SIGNAL: <span className="text-green-600 font-bold animate-pulse">LIVE</span><br />
                                        STATUS: ACTIVE
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="md:col-span-8 space-y-20 md:space-y-24">

                            {/* Bio - Increased Line Height */}
                            <div className="space-y-8 group reveal-blur delay-200">
                                <h3 className="text-2xl font-bold text-black transition-colors duration-300 group-hover:text-blue-600">
                                    10+ Years Building High-Scale Systems
                                </h3>
                                <p className="text-lg text-zinc-600 leading-loose font-light">
                                    I design the digital engines that power modern businesses. My background is in <InteractiveText>backend engineering</InteractiveText> and <InteractiveText>system architecture</InteractiveText>.
                                    I specialize in taking complex, slow, or broken software and turning it into fast, <InteractiveText>reliable systems</InteractiveText> that don't crash under pressure.
                                </p>
                            </div>

                            <div className="h-[1px] w-full bg-zinc-100 reveal-blur delay-300"></div>

                            {/* Technical DNA Section - RESPONSIVE SCROLL */}
                            <div className="reveal-blur delay-400 relative">

                                <div className="flex flex-col md:flex-row md:justify-between md:items-end mb-6 md:mb-12 gap-4">
                                    <h3 className="text-4xl sm:text-5xl font-black tracking-tighter text-black uppercase leading-none break-words">
                                        Core Capabilities
                                    </h3>

                                    {/* Universal Instruction: Scroll/Swipe Hint */}
                                    <div className="flex items-center gap-2 text-zinc-400 animate-pulse">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                        <span className="text-[10px] font-mono uppercase tracking-widest">Scroll to Explore</span>
                                    </div>
                                </div>

                                {/* Scroll Container */}
                                {/* Manual Horizontal Scroll for ALL Devices */}
                                <div className="w-full overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] pb-4">
                                    <div className="flex gap-6 w-max px-6 md:px-4">
                                        {scrollSkills.map((card, i) => (
                                            <TechCard
                                                key={i}
                                                {...card}
                                            />
                                        ))}
                                    </div>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
            </section>

            {/* BOTTOM SEPARATOR */}
            <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-b border-white/10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
                    {Array(10).fill("THE MINDSET // PHILOSOPHY // ").map((t, i) => (
                        <span key={i} className="opacity-80">{t}</span>
                    ))}
                </div>
            </div>
        </>
    );
};