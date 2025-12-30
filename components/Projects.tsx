import React, { useState, useEffect, useRef } from 'react';
import { SectionId, Project } from '../types';

const projects: Project[] = [
    {
        id: '01',
        title: 'Trading Core',
        category: 'Finance',
        description: 'A high-speed trading engine processing thousands of orders in microseconds. Built for zero-latency execution environments.',
        techStack: ['Rust', 'Linux Kernel', 'UDP Multicast'],
        metrics: 'Latency: <80µs',
        stats: {
            value: 80,
            label: 'Avg Latency',
            prefix: '< ',
            suffix: ' µs',
            decimals: 1,
            isLive: true,
            trend: 'down'
        }
    },
    {
        id: '02',
        title: 'Data Mesh',
        category: 'IoT Infrastructure',
        description: 'Distributed ingestion network for 50k+ sensors. Handles massive concurrency without data loss using back-pressure mechanisms.',
        techStack: ['Go', 'Apache Kafka', 'gRPC'],
        metrics: '1.2B Ops/Day',
        stats: {
            value: 1.25,
            label: 'Ops / Day',
            suffix: ' B',
            decimals: 3,
            isLive: true, // Will increment slowly
            trend: 'up'
        }
    },
    {
        id: '03',
        title: 'Ledger V3',
        category: 'DeFi Security',
        description: 'Cryptographically secure transaction ledger. Reduces gas fees by 92% using ZK-Rollups and optimized smart contracts.',
        techStack: ['Solidity', 'Zero-Knowledge', 'Web3'],
        metrics: 'Cost: -92%',
        stats: {
            value: 92,
            label: 'Gas Reduction',
            prefix: '-',
            suffix: '%',
            decimals: 0,
            isLive: false,
            trend: 'neutral'
        }
    },
    {
        id: '04',
        title: 'Auth Gateway',
        category: 'Enterprise Access',
        description: 'Unified identity provider replacing 12 legacy systems. Features adaptive rate-limiting and anomaly detection.',
        techStack: ['Node.js', 'OAuth2', 'Redis'],
        metrics: 'Uptime: 100%',
        stats: {
            value: 99.999,
            label: 'System Uptime',
            suffix: '%',
            decimals: 3,
            isLive: true, // Micro fluctuations
            trend: 'neutral'
        }
    }
];

// --- LIVING METRIC ANIMATOR ---
const LivingMetric = ({ stats, isActive }: { stats: NonNullable<Project['stats']>, isActive: boolean }) => {
    const [displayValue, setDisplayValue] = useState(0);

    // Initial Count Up
    useEffect(() => {
        if (!isActive) return;

        let start = 0;
        const end = stats.value;
        const duration = 1500;
        const startTime = performance.now();

        const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4); // Ease Out Quart

            setDisplayValue(start + (end - start) * ease);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayValue(end);
            }
        };
        requestAnimationFrame(animate);
    }, [stats, isActive]);

    // Live Fluctuation Effect
    useEffect(() => {
        if (!isActive || !stats.isLive) return;

        const interval = setInterval(() => {
            setDisplayValue(prev => {
                // Determine fluctuation based on stats
                let variance = 0;

                if (stats.label.includes('Latency')) {
                    // Latency jitters up and down
                    variance = (Math.random() - 0.5) * 5;
                } else if (stats.label.includes('Ops')) {
                    // Ops always go up slowly
                    variance = Math.random() * 0.0001;
                } else if (stats.label.includes('Uptime')) {
                    // Uptime stays mostly stable but maybe micro jitter in last decimal? 
                    // Actually 99.999 usually static, let's keep it mostly static
                    variance = 0;
                }

                return prev + variance;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [isActive, stats]);

    return (
        <div className="text-right">
            <span className="block font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                {stats.label}
            </span>
            <div className="flex items-center justify-end gap-2">
                {/* Live Indicator */}
                {stats.isLive && isActive && (
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                )}

                <span className="block font-mono text-2xl font-bold text-black tabular-nums">
                    {stats.prefix}
                    {displayValue.toFixed(stats.decimals)}
                    {stats.suffix}
                </span>
            </div>

            {/* Trend Line Visual */}
            <div className="w-full flex justify-end mt-1 opacity-50">
                <div className="h-[2px] w-16 bg-zinc-100 overflow-hidden relative rounded-full">
                    <div className={`absolute top-0 left-0 h-full w-full bg-zinc-300 origin-left animate-pulse`} />
                </div>
            </div>
        </div>
    );
};

// --- SYSTEM TOPOLOGY VISUALIZER ---
const SystemTopology = ({ activeProject }: { activeProject: Project }) => {
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

        // Node setup
        const center = { x: width / 2, y: height / 2 };
        const satellites = activeProject.techStack.map((_, i, arr) => {
            const angle = (i / arr.length) * Math.PI * 2;
            const radius = 100; // Distance from center
            return {
                x: center.x + Math.cos(angle) * radius,
                y: center.y + Math.sin(angle) * radius,
                label: activeProject.techStack[i]
            };
        });

        // Particle System
        const particles: {
            fromIdx: number,
            progress: number,
            speed: number
        }[] = [];

        // Color based on category
        let color = '100, 100, 100'; // Default gray
        if (activeProject.category.includes('Finance')) color = '34, 197, 94'; // Green
        else if (activeProject.category.includes('IoT')) color = '59, 130, 246'; // Blue
        else if (activeProject.category.includes('Security')) color = '168, 85, 247'; // Purple
        else if (activeProject.category.includes('Access')) color = '249, 115, 22'; // Orange

        let time = 0;
        let animId: number;

        const loop = () => {
            time += 0.02;
            ctx.clearRect(0, 0, width, height);

            // Update Center Position (Floating effect)
            const floatY = Math.sin(time) * 5;
            const floatX = Math.cos(time * 0.5) * 5;
            const cx = (width / 2) / dpr + floatX; // Adjust for scale context
            const cy = (height / 2) / dpr + floatY;

            // Spawn particles
            if (Math.random() < 0.05) {
                particles.push({
                    fromIdx: Math.floor(Math.random() * satellites.length),
                    progress: 0,
                    speed: 0.01 + Math.random() * 0.02
                });
            }

            // Draw Connections
            satellites.forEach((sat, i) => {
                // Recalculate based on canvas center
                const ang = (i / satellites.length) * Math.PI * 2 + time * 0.1;
                const rad = 120;
                const rx = (width / 2) / dpr + Math.cos(ang) * rad;
                const ry = (height / 2) / dpr + Math.sin(ang) * rad;

                // Draw Line
                ctx.beginPath();
                ctx.moveTo(rx, ry);
                ctx.lineTo(cx, cy);
                ctx.strokeStyle = `rgba(${color}, 0.1)`;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Draw Satellite Node
                ctx.beginPath();
                ctx.arc(rx, ry, 4, 0, Math.PI * 2);
                ctx.fillStyle = `rgb(${color})`;
                ctx.fill();

                // Draw Label
                ctx.fillStyle = `rgba(${color}, 0.7)`;
                ctx.font = '10px JetBrains Mono';
                ctx.fillText(sat.label, rx + 10, ry + 3);

                // Update particles for this path
                particles.forEach((p, pIdx) => {
                    if (p.fromIdx === i) {
                        p.progress += p.speed;
                        if (p.progress >= 1) {
                            particles.splice(pIdx, 1);
                            return;
                        }

                        const px = rx + (cx - rx) * p.progress;
                        const py = ry + (cy - ry) * p.progress;

                        ctx.beginPath();
                        ctx.arc(px, py, 2, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(${color}, ${1 - p.progress})`;
                        ctx.fill();
                    }
                });
            });

            // Draw Center Node (The Core)
            ctx.beginPath();
            ctx.arc(cx, cy, 12, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(24, 24, 27)`; // Zinc-900
            ctx.fill();
            ctx.strokeStyle = `rgb(${color})`;
            ctx.lineWidth = 2;
            ctx.stroke();

            // Pulse Ring
            const pulse = (Math.sin(time * 3) + 1) / 2;
            ctx.beginPath();
            ctx.arc(cx, cy, 12 + pulse * 10, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(${color}, ${0.5 - pulse * 0.5})`;
            ctx.lineWidth = 1;
            ctx.stroke();

            animId = requestAnimationFrame(loop);
        };

        loop();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, [activeProject]);

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />;
};

// Reusable Tech Pill
const TechBadge = ({ label }: { label: string }) => (
    <span className="px-2 py-1 text-[10px] font-mono border border-zinc-200 text-zinc-500 rounded bg-zinc-50">
        {label}
    </span>
);

export const Projects: React.FC = () => {
    const [activeId, setActiveId] = useState<string>('01');
    const [animating, setAnimating] = useState(false);

    const handleSelect = (id: string) => {
        if (id === activeId) return;
        setAnimating(true);
        setTimeout(() => {
            setActiveId(id);
            setAnimating(false);
        }, 300); // Wait for fade out
    };

    const activeProject = projects.find(p => p.id === activeId)!;

    return (
        <>
            {/* SEPARATOR - NOW BLACK TO MATCH TELEMETRY */}
            <div className="w-full bg-black text-white py-3 overflow-hidden border-b border-white/10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-[10px] uppercase tracking-widest">
                    {Array(10).fill("ACTIVE PROTOCOLS // SYSTEM LOGS // ").map((t, i) => (
                        <span key={i} className="opacity-80">{t}</span>
                    ))}
                </div>
            </div>

            <section id={SectionId.PROJECTS} className="bg-white py-24 md:py-32 relative overflow-hidden min-h-[800px]">

                {/* Background Grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.3]"
                    style={{
                        backgroundImage: 'linear-gradient(#f4f4f5 1px, transparent 1px), linear-gradient(90deg, #f4f4f5 1px, transparent 1px)',
                        backgroundSize: '40px 40px'
                    }}
                />

                <div className="max-w-6xl mx-auto px-6 relative z-10">

                    <div className="mb-16">
                        <span className="font-mono text-xs text-blue-600 uppercase tracking-widest block mb-3">(02) Schematics</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tighter">System Directory</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

                        {/* LEFT COLUMN: DIRECTORY LIST */}
                        <div className="lg:col-span-4 flex flex-col space-y-2">
                            <div className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest mb-4 pl-2 border-b border-zinc-100 pb-2 flex justify-between">
                                <span>Process Name</span>
                                <span>Action</span>
                            </div>

                            {projects.map((p) => (
                                <button
                                    key={p.id}
                                    onClick={() => handleSelect(p.id)}
                                    className={`
                            group w-full flex items-center justify-between p-4 rounded-lg text-left transition-all duration-300
                            ${activeId === p.id
                                            ? 'bg-zinc-900 text-white shadow-lg scale-[1.02]'
                                            : 'bg-transparent text-zinc-500 hover:bg-zinc-50 hover:text-black'
                                        }
                          `}
                                >
                                    <div className="flex flex-col">
                                        <span className={`font-mono text-xs mb-1 ${activeId === p.id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                            /proj/{p.id}
                                        </span>
                                        <span className="font-bold text-lg tracking-tight">{p.title}</span>
                                    </div>

                                    {/* Action Button / Status */}
                                    <div className="flex items-center gap-3">
                                        <div className={`
                                  px-3 py-1.5 rounded border text-[10px] font-mono font-bold uppercase tracking-wider transition-all
                                  ${activeId === p.id
                                                ? 'border-green-500/30 bg-green-500/10 text-green-400 shadow-[0_0_10px_rgba(34,197,94,0.2)]'
                                                : 'border-zinc-200 bg-white text-zinc-400 group-hover:border-black group-hover:text-black group-hover:bg-zinc-100'
                                            }
                              `}>
                                            {activeId === p.id ? 'ACTIVE' : 'ACCESS >'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* RIGHT COLUMN: INSPECTOR PANEL */}
                        <div className="lg:col-span-8 relative">
                            {/* Main Content Card */}
                            <div
                                className={`
                            h-full flex flex-col justify-between transition-all duration-300 ease-in-out relative
                            ${animating ? 'opacity-0 translate-y-4 blur-sm' : 'opacity-100 translate-y-0 blur-0'}
                        `}
                            >
                                {/* CANVAS TOPOLOGY BACKGROUND */}
                                <div className="absolute -inset-10 z-0">
                                    <SystemTopology activeProject={activeProject} />
                                </div>

                                <div className="relative z-10 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-white/50 shadow-sm">
                                    {/* Header Info */}
                                    <div className="flex items-start justify-between border-b border-zinc-100 pb-8 mb-8">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded">
                                                    {activeProject.category}
                                                </span>
                                                <span className="font-mono text-[10px] text-zinc-400">BUILD_ID: 8823f</span>
                                            </div>
                                            <h3 className="text-4xl md:text-6xl font-black text-black tracking-tight leading-none mb-4">
                                                {activeProject.title}
                                            </h3>
                                        </div>

                                        {/* ANIMATED METRICS */}
                                        <div className="hidden md:block">
                                            {activeProject.stats && (
                                                <LivingMetric stats={activeProject.stats} isActive={!animating} />
                                            )}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <p className="text-xl text-zinc-600 font-light leading-relaxed mb-10 max-w-2xl">
                                        {activeProject.description}
                                    </p>

                                    {/* Stack */}
                                    <div className="mb-12">
                                        <span className="font-mono text-[10px] text-zinc-400 uppercase tracking-widest block mb-3">Architecture Stack</span>
                                        <div className="flex flex-wrap gap-2">
                                            {activeProject.techStack.map(t => <TechBadge key={t} label={t} />)}
                                        </div>
                                    </div>

                                    {/* Visual Footer */}
                                    <div className="bg-zinc-50 rounded-xl p-6 border border-zinc-100 flex items-center justify-between">
                                        <div className="flex gap-4">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold uppercase text-zinc-400">Uptime</span>
                                                <span className="font-mono text-sm font-bold">99.999%</span>
                                            </div>
                                            <div className="w-px h-8 bg-zinc-200"></div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-bold uppercase text-zinc-400">Errors</span>
                                                <span className="font-mono text-sm font-bold text-green-600">0.00%</span>
                                            </div>
                                        </div>

                                        <button className="text-xs font-bold uppercase tracking-widest border-b border-black hover:text-blue-600 hover:border-blue-600 transition-colors">
                                            View Source -&gt;
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </>
    );
};