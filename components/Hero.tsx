import React, { useRef, useEffect, useState } from 'react';
import { SectionId } from '../types';

// Scramble Text Component (Slower, more readable)
const ScrambleText = ({ text, delay = 0 }: { text: string, delay?: number }) => {
    const [display, setDisplay] = useState('');
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    useEffect(() => {
        let timeout: any;
        let interval: any;

        setDisplay('');

        timeout = setTimeout(() => {
            let iteration = 0;
            interval = setInterval(() => {
                setDisplay(
                    text
                        .split('')
                        .map((_, index) => {
                            if (index < iteration) {
                                return text[index];
                            }
                            return chars[Math.floor(Math.random() * chars.length)];
                        })
                        .join('')
                );

                if (iteration >= text.length) {
                    clearInterval(interval);
                }

                iteration += 1 / 2;
            }, 40);
        }, delay);

        return () => {
            clearTimeout(timeout);
            clearInterval(interval);
        };
    }, [text, delay]);

    return <span>{display}</span>;
};

// Premium Static Reveal Text
const RevealTitle = ({
    text,
    delay = 0,
    className = "",
    isItalic = false
}: {
    text: string,
    delay?: number,
    className?: string,
    isItalic?: boolean
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setIsVisible(true), delay);
        return () => clearTimeout(t);
    }, [delay]);

    return (
        <div className={`overflow-hidden ${className}`}>
            <h1
                className={`
                    transform transition-all duration-[1200ms] cubic-bezier(0.16, 1, 0.3, 1)
                    ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-[120%] opacity-0'}
                    ${isItalic ? 'italic' : ''}
                    bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500
                `}
            >
                {text}
            </h1>
        </div>
    );
};

export const Hero: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [mouse, setMouse] = useState({ x: 0, y: 0 });
    const [btnHover, setBtnHover] = useState(false);

    // Cycling Text State
    const [subtitleIndex, setSubtitleIndex] = useState(0);
    const subtitles = [
        "ENGINEERING THE INVISIBLE",
        "ARCHITECTING RESILIENCE",
        "OPTIMIZING FOR CHAOS"
    ];

    useEffect(() => {
        setTimeout(() => setIsLoaded(true), 100);

        const interval = setInterval(() => {
            setSubtitleIndex((prev) => (prev + 1) % subtitles.length);
        }, 4500);

        return () => clearInterval(interval);
    }, []);

    // --- MOUSE HANDLER ---
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMouse({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // --- DEEP SPACE DRIFT ENGINE ---
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: true });
        if (!ctx) return;

        let width = window.innerWidth;
        let height = window.innerHeight;
        let dpr = Math.min(window.devicePixelRatio || 1, 2);

        const PARTICLE_COUNT = 350;

        interface Particle {
            x: number;
            y: number;
            z: number;
            opacity: number;
        }

        const particles: Particle[] = [];
        for (let i = 0; i < PARTICLE_COUNT; i++) {
            particles.push({
                x: (Math.random() - 0.5) * width,
                y: (Math.random() - 0.5) * height,
                z: Math.random() * width,
                opacity: Math.random()
            });
        }

        const resize = () => {
            width = window.innerWidth;
            height = window.innerHeight;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.scale(dpr, dpr);
        };
        window.addEventListener('resize', resize);
        resize();

        let animId: number;

        const loop = () => {
            ctx.clearRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            const moveX = mouse.x * 0.5;
            const moveY = mouse.y * 0.5;

            ctx.fillStyle = '#000000';

            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const p = particles[i];

                p.z -= 0.5;

                p.x -= moveX;
                p.y -= moveY;

                if (p.z <= 1 || Math.abs(p.x) > width || Math.abs(p.y) > height) {
                    p.z = width;
                    p.x = (Math.random() - 0.5) * width;
                    p.y = (Math.random() - 0.5) * height;
                }

                const scale = 500 / (500 + p.z);
                const x2d = cx + p.x * scale;
                const y2d = cy + p.y * scale;

                const size = Math.max(0.5, 2 * scale);
                const alpha = p.opacity * scale;

                ctx.globalAlpha = alpha;
                ctx.fillRect(x2d, y2d, size, size);
            }

            animId = requestAnimationFrame(loop);
        };

        animId = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, [mouse]);

    return (
        <section id={SectionId.HERO} ref={containerRef} className="relative w-full h-screen flex flex-col justify-center items-center overflow-hidden bg-white cursor-none perspective-container">

            {/* 3D Layer */}
            <canvas ref={canvasRef} className="absolute inset-0 z-0 opacity-60" />

            {/* Text Layer - With Dynamic Tilt */}
            <div
                className="relative z-10 w-full px-6 flex flex-col items-center justify-center pointer-events-none text-center mix-blend-exclusion text-white transition-transform duration-100 ease-out"
                style={{
                    transform: `perspective(1000px) rotateX(${mouse.y * 5}deg) rotateY(${mouse.x * -5}deg) translateZ(50px)`
                }}
            >

                {/* Subtitle Scramble */}
                <div className={`transition-all duration-1000 delay-300 mb-10 md:mb-12 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    <span className="font-mono text-xs md:text-sm tracking-[0.3em] uppercase border border-white/40 px-4 py-2 rounded-full backdrop-blur-sm min-w-[320px] inline-block">
                        <ScrambleText text={subtitles[subtitleIndex]} delay={200} />
                    </span>
                </div>

                <div className="font-black leading-[0.9] tracking-tighter flex flex-col items-center drop-shadow-2xl select-none">
                    {/* MAIN HEADLINE - Static, Premium Gradient */}
                    <div className="text-[12vw] md:text-[11rem] flex flex-col items-center gap-0 md:gap-2">
                        <RevealTitle
                            text="PRECISION"
                            delay={200}
                        />

                        <RevealTitle
                            text="AT SCALE."
                            delay={400}
                            isItalic={true}
                            className="opacity-90 mt-2 md:mt-4"
                        />
                    </div>
                </div>

                <p className={`mt-12 max-w-xl text-lg md:text-xl opacity-70 font-light leading-relaxed transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-70 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                    Orchestrating complexity. Building fault-tolerant distributed systems
                    that breathe data and scale infinitely.
                </p>

            </div>

            {/* Bottom CTA */}
            <div className={`absolute bottom-12 w-full flex justify-between px-12 items-end pointer-events-auto transition-all duration-1000 delay-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'} hidden md:flex mix-blend-exclusion text-white`}>
                <div className="flex flex-col gap-1 font-mono text-[10px] opacity-60">
                    <span>DEPTH: INFINITE</span>
                    <span>STATUS: STABLE</span>
                </div>

                <button
                    onClick={() => document.getElementById(SectionId.PROJECTS)?.scrollIntoView({ behavior: 'smooth' })}
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    className="group flex items-center gap-4 text-xs font-bold uppercase tracking-widest transition-all duration-300 relative"
                >
                    <span className={`transition-transform duration-300 ${btnHover ? 'translate-x-2' : ''}`}>Explore Systems</span>
                    <div className={`h-[1px] bg-white transition-all duration-300 ${btnHover ? 'w-24' : 'w-12'}`}></div>

                    {/* Hover Glitch Effect Element */}
                    <div className={`absolute -inset-2 bg-white/10 blur-lg transition-opacity duration-300 ${btnHover ? 'opacity-100' : 'opacity-0'}`}></div>
                </button>
            </div>

        </section>
    );
};