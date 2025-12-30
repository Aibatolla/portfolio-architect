import React, { useEffect, useRef, useState } from 'react';
import { SectionId } from '../types';

// --- VISUAL ENGINE: THE SINGULARITY ---
const SingularityCanvas = ({ active, onPulse }: { active: boolean, onPulse: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const requestRef = useRef<number>(0);
    const timeRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;

        const resize = () => {
            if (canvas) {
                width = canvas.offsetWidth;
                height = canvas.offsetHeight;
                canvas.width = width;
                canvas.height = height;
            }
        };
        resize();
        window.addEventListener('resize', resize);

        // PARTICLES
        const COUNT = 600;
        const CENTER_SAFE_ZONE = 100;

        interface Particle {
            angle: number;
            radius: number;
            speed: number;
            size: number;
            color: string;
        }

        const particles: Particle[] = [];
        for (let i = 0; i < COUNT; i++) {
            particles.push({
                angle: Math.random() * Math.PI * 2,
                radius: CENTER_SAFE_ZONE + Math.random() * (Math.min(width, height) / 2 - CENTER_SAFE_ZONE),
                speed: 0.002 + Math.random() * 0.005,
                size: Math.random() * 2,
                color: Math.random() > 0.5 ? '#60a5fa' : '#a855f7' // Blue/Purple
            });
        }

        let pulseStrength = 0;

        const loop = () => {
            // Fade effect for trails
            ctx.fillStyle = 'rgba(5, 5, 5, 0.2)';
            ctx.fillRect(0, 0, width, height);

            const cx = width / 2;
            const cy = height / 2;

            timeRef.current += 0.01;

            // Pulse logic
            if (active) pulseStrength = 0.5 + Math.sin(timeRef.current * 10) * 0.2;
            else pulseStrength = Math.max(0, pulseStrength * 0.95);

            if (onPulse) {
                ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * Math.random()})`;
                ctx.fillRect(0, 0, width, height);
            }

            particles.forEach(p => {
                // Update
                p.angle += p.speed * (active ? 3 : 1);

                // Draw
                const x = cx + Math.cos(p.angle) * p.radius;
                const y = cy + Math.sin(p.angle) * p.radius;

                // Perspective / Depth
                const size = p.size * (1 + pulseStrength);

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = 0.6 + pulseStrength * 0.4;
                ctx.fill();

                // Beam effect if active
                if (active && Math.random() > 0.98) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(cx, cy);
                    ctx.strokeStyle = `rgba(255, 255, 255, 0.05)`;
                    ctx.stroke();
                }
            });

            // Center Black Hole (Behind UI)
            const holeSize = CENTER_SAFE_ZONE - 10 + Math.sin(timeRef.current * 2) * 5;
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, holeSize + 20);
            grad.addColorStop(0, '#000');
            grad.addColorStop(0.8, 'rgba(0,0,0,0.8)');
            grad.addColorStop(1, 'rgba(0,0,0,0)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, width, height);

            requestRef.current = requestAnimationFrame(loop);
        };

        requestRef.current = requestAnimationFrame(loop);

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(requestRef.current);
        };
    }, [active, onPulse]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

interface ResponseData {
    title: string;
    body: string;
    type: 'info' | 'link' | 'success';
    link?: string;
    linkText?: string;
}

// --- HOLOGRAPHIC INTERFACE ---
export const Telemetry: React.FC = () => {
    const [input, setInput] = useState('');
    const [response, setResponse] = useState<ResponseData | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [pulse, setPulse] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Visual Feedback
        setPulse(true);
        setTimeout(() => setPulse(false), 200);
        setIsTyping(true);
        setResponse(null);

        // Simulation of "Processing"
        setTimeout(() => {
            const lower = input.toLowerCase();
            let res: ResponseData = { title: 'SYSTEM ERROR', body: 'Command not recognized.', type: 'info' };

            if (lower.includes('git') || lower.includes('code') || lower.includes('repo')) {
                res = {
                    title: 'REPOSITORY DETECTED',
                    body: 'Public access granted to GitHub Repositories.',
                    type: 'link',
                    link: 'https://github.com',
                    linkText: 'OPEN GITHUB'
                };
            } else if (lower.includes('hello') || lower.includes('hi')) {
                res = {
                    title: 'HANDSHAKE ACCEPTED',
                    body: 'Greetings. I am the digital construct of this portfolio. State your intent.',
                    type: 'info'
                };
            } else if (lower.includes('contact') || lower.includes('email') || lower.includes('share') || lower.includes('write')) {
                res = {
                    title: 'COMM-LINK ESTABLISHED',
                    body: 'Secure channel ready for transmission.',
                    type: 'link',
                    link: 'mailto:hello@example.com',
                    linkText: 'SEND TRANSMISSION'
                };
            } else if (lower.includes('skill') || lower.includes('stack')) {
                res = {
                    title: 'CAPABILITIES LISTED',
                    body: 'Core: Rust, Go, Kubernetes, Distributed Systems Architecture.',
                    type: 'info'
                };
            } else {
                // Default "Thinking" AI response simulation
                res = {
                    title: 'QUERY PROCESSED',
                    body: `Analysis complete for: "${input}". Data has been logged to the system core.`,
                    type: 'success'
                };
            }

            setIsTyping(false);
            setResponse(res);
            setInput('');
        }, 800);
    };

    return (
        <>
            {/* TOP SEPARATOR - BLACK MARQUEE */}
            <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-b border-white/10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
                    {Array(10).fill("INTERACTIVE TERMINAL // DIRECT UPLINK // ").map((t, i) => (
                        <span key={i} className="opacity-80">{t}</span>
                    ))}
                </div>
            </div>

            <section id={SectionId.TELEMETRY} className="relative h-[600px] bg-black overflow-hidden flex items-center justify-center border-b border-white/10">

                {/* 3D Background */}
                <SingularityCanvas active={isTyping || !!input} onPulse={pulse} />

                {/* Foreground UI */}
                <div className="relative z-10 w-full max-w-2xl px-6">

                    {/* Header / Instructions */}
                    <div className={`text-center mb-8 transition-opacity duration-500 ${response ? 'opacity-50' : 'opacity-100'}`}>
                        <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full border border-white/10 bg-black/50 backdrop-blur">
                            <span className={`w-2 h-2 rounded-full ${isTyping ? 'bg-orange-500 animate-bounce' : 'bg-blue-500 animate-pulse'}`}></span>
                            <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest">
                                {isTyping ? 'PROCESSING DATA STREAM...' : 'SYSTEM IDLE // AWAITING INPUT'}
                            </span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-2 tracking-tighter mix-blend-difference">
                            ASK THE ARCHITECT
                        </h2>
                        <p className="text-zinc-500 text-sm font-mono">
                            Query the system to find code, contact details, or status.
                        </p>
                    </div>

                    {/* Input Field (The "Command Line") */}
                    <form onSubmit={handleSubmit} className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 rounded-lg blur opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
                        <div className="relative flex items-center bg-black border border-white/20 rounded-lg overflow-hidden transition-colors focus-within:border-white/50">
                            <span className="pl-4 text-zinc-500 font-mono select-none">{'>'}</span>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type 'GitHub', 'Contact', or ask a question..."
                                className="w-full bg-transparent text-white font-mono p-4 focus:outline-none placeholder-zinc-700 uppercase tracking-wider"
                            />
                            <button
                                type="submit"
                                disabled={!input}
                                className="px-6 py-4 bg-white/5 hover:bg-white text-zinc-400 hover:text-black font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-0 disabled:pointer-events-none"
                            >
                                Execute
                            </button>
                        </div>
                    </form>

                    {/* Quick Actions (For users who don't want to type) */}
                    {!response && !isTyping && (
                        <div className="flex justify-center gap-4 mt-6">
                            {['Get GitHub', 'Send Email', 'Status Report'].map(txt => (
                                <button
                                    key={txt}
                                    onClick={() => { setInput(txt); }}
                                    className="text-[10px] font-mono text-zinc-600 border border-zinc-800 px-3 py-1 rounded hover:border-zinc-500 hover:text-zinc-300 transition-colors uppercase"
                                >
                                    {txt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* THE RESPONSE CARD (Holographic Pop-up) */}
                    {response && (
                        <div className="mt-8 animate-in slide-in-from-bottom-4 fade-in duration-500">
                            <div className="bg-black/80 backdrop-blur-xl border border-white/20 p-6 rounded-xl relative overflow-hidden shadow-2xl">
                                {/* Scanning line effect */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-shimmer"></div>

                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className={`text-[10px] font-mono uppercase tracking-widest mb-1 block ${response.type === 'link' ? 'text-blue-400' : 'text-green-400'
                                            }`}>
                                            {response.type === 'link' ? '>> LINK FOUND' : '>> DATA RETRIEVED'}
                                        </span>
                                        <h3 className="text-xl font-bold text-white">{response.title}</h3>
                                    </div>
                                    <button onClick={() => setResponse(null)} className="text-zinc-500 hover:text-white">
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                <p className="text-zinc-400 leading-relaxed mb-6 font-light">
                                    {response.body}
                                </p>

                                {/* Action Button if Link */}
                                {response.link && (
                                    <a
                                        href={response.link}
                                        className="inline-flex items-center gap-2 bg-white text-black px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all w-full justify-center group"
                                    >
                                        {response.linkText}
                                        <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                </div>
            </section>
        </>
    );
};