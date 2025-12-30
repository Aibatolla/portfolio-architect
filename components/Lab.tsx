import React, { useEffect, useRef, useState } from 'react';
import { SectionId } from '../types';

const LiveCard = ({
    iconPath,
    title,
    description,
    metricName,
    metricValue,
    barColor,
    barWidthPercent
}: {
    iconPath: string,
    title: string,
    description: string,
    metricName: string,
    metricValue: string,
    barColor: string,
    barWidthPercent: number
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [liveWidth, setLiveWidth] = useState(barWidthPercent);
    const [transform, setTransform] = useState('');

    useEffect(() => {
        const interval = setInterval(() => {
            const fluctuation = (Math.random() - 0.5) * 8;
            setLiveWidth(Math.min(100, Math.max(70, barWidthPercent + fluctuation)));
        }, 800);
        return () => clearInterval(interval);
    }, [barWidthPercent]);

    const handleMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`);
    };

    const handleLeave = () => {
        setTransform('perspective(1000px) rotateX(0) rotateY(0) scale(1)');
    };

    return (
        <div
            ref={cardRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            className="group relative bg-white/90 backdrop-blur-md border border-zinc-200 p-8 rounded-xl shadow-lg transition-all duration-500 ease-out z-20 overflow-hidden flex flex-col justify-between h-[280px] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.2)] hover:-translate-y-2"
            style={{ transform, transition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.3s ease-out' }}
        >
            <div>
                <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-lg mb-6 shadow-sm group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
                    </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{description}</p>
            </div>

            <div className="mt-8">
                <div className="flex justify-between text-xs font-bold mb-3 font-mono uppercase tracking-wider text-zinc-900">
                    <span>{metricName}</span>
                    <span className="transition-all duration-500">{metricValue}</span>
                </div>
            </div>

            {/* FULL WIDTH SHARP BOTTOM BAR */}
            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-zinc-100">
                <div
                    className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                    style={{ width: `${liveWidth}%` }}
                ></div>
            </div>
        </div>
    );
};

export const Lab: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [mouse, setMouse] = useState({ x: -1000, y: -1000 });

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!canvasRef.current) return;
        const rect = canvasRef.current.getBoundingClientRect();
        setMouse({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false });
        if (!ctx) return;

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Cap DPR for performance

        const GRID_SIZE = 12;
        const CELL_SIZE = 40;

        interface Block {
            x: number;
            y: number;
            h: number;
            targetH: number;
        }

        const grid: Block[] = [];
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                grid.push({ x: i, y: j, h: 0, targetH: 0 });
            }
        }

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

        const drawIsoRect = (x: number, y: number, h: number) => {
            const isoX = (x - y) * CELL_SIZE;
            const isoY = (x + y) * CELL_SIZE * 0.5;

            const screenX = width / 2 + isoX;
            const screenY = height / 2 + isoY;

            if (h < 2) return;

            // Optimized drawing: Stroke only once per loop
            ctx.beginPath();

            // Left Face
            ctx.fillStyle = '#f4f4f5';
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX - CELL_SIZE, screenY - CELL_SIZE * 0.5);
            ctx.lineTo(screenX - CELL_SIZE, screenY - h - CELL_SIZE * 0.5);
            ctx.lineTo(screenX, screenY - h);
            ctx.fill();

            // Right Face
            ctx.fillStyle = '#e4e4e7';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY);
            ctx.lineTo(screenX + CELL_SIZE, screenY - CELL_SIZE * 0.5);
            ctx.lineTo(screenX + CELL_SIZE, screenY - h - CELL_SIZE * 0.5);
            ctx.lineTo(screenX, screenY - h);
            ctx.fill();

            // Top Face
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(screenX, screenY - h);
            ctx.lineTo(screenX - CELL_SIZE, screenY - h - CELL_SIZE * 0.5);
            ctx.lineTo(screenX + CELL_SIZE, screenY - h - CELL_SIZE * 0.5);
            ctx.fill();

            // Borders (Batch stroke for performance?) No, need correct overlap.
            ctx.strokeStyle = '#d4d4d8';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        };

        let animId: number;
        const loop = () => {
            time += 0.05; // Increased speed
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, width, height);

            const mx = mouse.x * dpr;
            const my = mouse.y * dpr;

            grid.forEach(b => {
                const isoX = (b.x - b.y) * CELL_SIZE;
                const isoY = (b.x + b.y) * CELL_SIZE * 0.5;
                const screenX = width / 2 + isoX;
                const screenY = height / 2 + isoY;

                // INCREASED AMPLITUDE: Wave is taller (30) and base is higher (20)
                const wave = Math.sin(b.x * 0.3 + time) * Math.cos(b.y * 0.3 + time) * 30 + 20;

                // Mouse Interaction
                const dx = mx - screenX;
                const dy = my - screenY;
                const dist = Math.sqrt(dx * dx + dy * dy);
                let hoverEffect = 0;

                if (dist < 300) {
                    hoverEffect = (300 - dist) / 5;
                }

                b.targetH = wave + hoverEffect;
                b.h += (b.targetH - b.h) * 0.1; // Faster lerp
            });

            for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                    const b = grid.find(block => block.x === i && block.y === j);
                    if (b) drawIsoRect(b.x, b.y, b.h);
                }
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
        <>
            {/* SEPARATOR */}
            <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-b border-white/10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
                    {Array(10).fill("BUILT TO LAST // SCALABLE SYSTEMS // ").map((t, i) => (
                        <span key={i} className="opacity-80">{t}</span>
                    ))}
                </div>
            </div>

            <section
                id={SectionId.LAB}
                ref={containerRef}
                className="py-32 bg-white relative overflow-hidden flex flex-col items-center min-h-[900px]"
                onMouseMove={handleMouseMove}
            >

                {/* Background Canvas (Clearly Visible) */}
                <div className="absolute inset-0 z-0 opacity-100 pointer-events-none">
                    <canvas ref={canvasRef} className="w-full h-full" />
                </div>

                {/* Gradient Overlay for Readability */}
                <div className="absolute inset-0 bg-gradient-to-b from-white/90 via-white/20 to-white/90 z-10 pointer-events-none" />

                {/* CONTENT */}
                <div className="max-w-7xl mx-auto px-6 relative z-20 w-full mt-12">

                    <div className="text-center mb-16">
                        <span className="font-mono text-xs text-black font-bold uppercase tracking-widest bg-white/80 backdrop-blur px-2 py-1 border border-zinc-200">
                            (03) Architecture Standards
                        </span>

                        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-black mt-6 mb-4 leading-tight">
                            Built to <span className="text-zinc-400">Scale</span>.
                        </h2>
                        <p className="max-w-xl mx-auto text-zinc-600 bg-white/50 backdrop-blur-sm rounded p-2 font-medium">
                            My systems are designed to handle growth effortlessly. No hidden complexity, just robust engineering.
                        </p>
                    </div>

                    {/* STATIC CARDS */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                        <LiveCard
                            title="High Performance"
                            description="Optimized for speed. Every request is processed in milliseconds."
                            iconPath="M13 10V3L4 14h7v7l9-11h-7z"
                            metricName="LATENCY"
                            metricValue="< 12ms"
                            barColor="bg-green-500"
                            barWidthPercent={95}
                        />

                        <LiveCard
                            title="Unbreakable Security"
                            description="Bank-grade encryption and zero-trust architecture built in."
                            iconPath="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            metricName="PROTECTION"
                            metricValue="100%"
                            barColor="bg-blue-600"
                            barWidthPercent={100}
                        />

                        <LiveCard
                            title="100% Uptime"
                            description="Redundant systems ensure your service never goes offline."
                            iconPath="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                            metricName="AVAILABILITY"
                            metricValue="99.99%"
                            barColor="bg-purple-600"
                            barWidthPercent={99}
                        />

                    </div>

                </div>
            </section>
        </>
    );
};