import React, { useEffect, useRef, useState } from 'react';
import { SectionId } from '../types';

interface Node {
    id: string;
    x: number;
    y: number;
    type: 'lb' | 'svc' | 'db' | 'mq';
    label: string;
    status: 'healthy' | 'busy' | 'idle';
}

interface Link {
    from: string;
    to: string;
    traffic: number; // 0-1 density
}

interface Zone {
    label: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

export const Skills: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.1 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    // Handle 3D Tilt
    const handleContainerMouseMove = (e: React.MouseEvent) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setTilt({ x, y });
    };

    const handleContainerMouseLeave = () => {
        setTilt({ x: 0, y: 0 });
    };

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width = canvas.offsetWidth;
        let height = canvas.offsetHeight;
        const dpr = window.devicePixelRatio || 1;

        // Mouse tracking for hover effects inside canvas
        let mouse = { x: -1000, y: -1000 };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse = { x: -1000, y: -1000 };
        };

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);

        const zones: Zone[] = [
            { label: 'USERS', x: 0.05, y: 0.1, w: 0.25, h: 0.8 },
            { label: 'APP LOGIC', x: 0.35, y: 0.05, w: 0.3, h: 0.9 },
            { label: 'DATA', x: 0.7, y: 0.1, w: 0.25, h: 0.8 },
        ];

        const nodes: Node[] = [
            // User Zone
            { id: 'cdn', x: 0.1, y: 0.2, type: 'lb', label: 'Fast Edge', status: 'healthy' },
            { id: 'waf', x: 0.1, y: 0.45, type: 'lb', label: 'Firewall', status: 'healthy' },
            { id: 'api_gw', x: 0.2, y: 0.6, type: 'lb', label: 'Traffic Ctrl', status: 'busy' },

            // App Zone
            { id: 'auth', x: 0.4, y: 0.25, type: 'svc', label: 'Login', status: 'healthy' },
            { id: 'order', x: 0.5, y: 0.5, type: 'svc', label: 'Core App', status: 'busy' },
            { id: 'pay', x: 0.4, y: 0.72, type: 'svc', label: 'Payments', status: 'idle' },
            { id: 'notif', x: 0.55, y: 0.65, type: 'svc', label: 'Alerts', status: 'healthy' },
            { id: 'stream', x: 0.5, y: 0.88, type: 'mq', label: 'Data Pipe', status: 'busy' },

            // Data Zone
            { id: 'redis', x: 0.75, y: 0.35, type: 'db', label: 'Cache', status: 'healthy' },
            { id: 'psql_m', x: 0.8, y: 0.55, type: 'db', label: 'Main DB', status: 'busy' },
            { id: 'psql_r', x: 0.85, y: 0.7, type: 'db', label: 'Backup DB', status: 'healthy' },
            { id: 's3', x: 0.8, y: 0.85, type: 'db', label: 'Files', status: 'idle' },
        ];

        const links: Link[] = [
            { from: 'cdn', to: 'waf', traffic: 0.2 },
            { from: 'waf', to: 'api_gw', traffic: 0.8 },
            { from: 'api_gw', to: 'auth', traffic: 0.5 },
            { from: 'api_gw', to: 'order', traffic: 0.9 },
            { from: 'api_gw', to: 'pay', traffic: 0.3 },
            { from: 'order', to: 'redis', traffic: 0.8 },
            { from: 'order', to: 'stream', traffic: 0.6 },
            { from: 'pay', to: 'psql_m', traffic: 0.4 },
            { from: 'stream', to: 'notif', traffic: 0.2 },
            { from: 'stream', to: 's3', traffic: 0.3 },
            { from: 'auth', to: 'redis', traffic: 0.4 },
            { from: 'psql_m', to: 'psql_r', traffic: 0.1 },
        ];

        const getStatusColor = (status: string, alpha = 1) => {
            switch (status) {
                case 'healthy': return `rgba(34, 197, 94, ${alpha})`;
                case 'busy': return `rgba(6, 182, 212, ${alpha})`;
                case 'idle': return `rgba(251, 191, 36, ${alpha})`;
                default: return `rgba(0, 0, 0, ${alpha})`;
            }
        };

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
        let animId: number;

        const render = () => {
            time += 1;
            ctx.clearRect(0, 0, width, height);

            // Add Volume Gradient
            const gradient = ctx.createRadialGradient(width / 2, height / 2, 0, width / 2, height / 2, width * 0.8);
            gradient.addColorStop(0, 'rgba(255,255,255,0)');
            gradient.addColorStop(1, 'rgba(240,240,242,0.5)'); // Vignette
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);

            let hoveredNodeId: string | null = null;
            nodes.forEach(node => {
                const nx = node.x * width;
                const ny = node.y * height;
                const dist = Math.hypot(mouse.x - nx, mouse.y - ny);
                if (dist < 25) hoveredNodeId = node.id;
            });

            // 1. Grid
            ctx.strokeStyle = '#f0f0f2';
            ctx.lineWidth = 1;
            ctx.beginPath();
            const GRID_STEP = 50;
            for (let x = 0; x <= width; x += GRID_STEP) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
            for (let y = 0; y <= height; y += GRID_STEP) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
            ctx.stroke();

            // 2. Zones
            zones.forEach(zone => {
                const zx = zone.x * width;
                const zy = zone.y * height;
                const zw = zone.w * width;
                const zh = zone.h * height;

                ctx.strokeStyle = '#e4e4e7';
                ctx.setLineDash([4, 4]);
                ctx.lineWidth = 1;
                ctx.strokeRect(zx, zy, zw, zh);

                ctx.fillStyle = '#a1a1aa';
                ctx.font = 'bold 9px JetBrains Mono';
                ctx.fillText(zone.label, zx + 10, zy + 15);
            });
            ctx.setLineDash([]);

            // 3. Links
            links.forEach(link => {
                const n1 = nodes.find(n => n.id === link.from);
                const n2 = nodes.find(n => n.id === link.to);
                if (!n1 || !n2) return;

                const x1 = n1.x * width;
                const y1 = n1.y * height;
                const x2 = n2.x * width;
                const y2 = n2.y * height;

                const isConnectionActive = hoveredNodeId === link.from || hoveredNodeId === link.to;

                ctx.beginPath();
                ctx.strokeStyle = isConnectionActive ? '#000' : '#d4d4d8';
                ctx.lineWidth = isConnectionActive ? 2 : 1.5;
                ctx.globalAlpha = isConnectionActive ? 1 : 0.6;

                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
                ctx.globalAlpha = 1;

                const dist = Math.hypot(x2 - x1, y2 - y1);
                const speed = 2 + link.traffic * 3;
                const particleCount = isConnectionActive ? 2 : 1;

                for (let i = 0; i < particleCount; i++) {
                    const offset = (time * speed + i * (dist / particleCount)) % dist;
                    const progress = offset / dist;
                    const px = x1 + (x2 - x1) * progress;
                    const py = y1 + (y2 - y1) * progress;

                    ctx.fillStyle = isConnectionActive ? '#000' : '#52525b';
                    ctx.beginPath();
                    ctx.arc(px, py, isConnectionActive ? 2.5 : 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            // 4. Nodes
            const sortedNodes = [...nodes].sort((a, b) => {
                if (a.id === hoveredNodeId) return 1;
                if (b.id === hoveredNodeId) return -1;
                return 0;
            });

            sortedNodes.forEach(node => {
                const nx = node.x * width;
                const ny = node.y * height;
                const isHovered = node.id === hoveredNodeId;

                const baseColor = getStatusColor(node.status, 1);

                if (node.status === 'busy' && !isHovered) {
                    const pulse = Math.sin(time * 0.1) * 5;
                    ctx.fillStyle = getStatusColor(node.status, 0.2);
                    ctx.beginPath();
                    ctx.arc(nx, ny, 16 + pulse, 0, Math.PI * 2);
                    ctx.fill();
                }

                if (isHovered) {
                    const ringPulse = (Math.sin(time * 0.15) + 1) * 0.5;
                    ctx.beginPath();
                    ctx.arc(nx, ny, 20 + (ringPulse * 8), 0, Math.PI * 2);
                    ctx.fillStyle = getStatusColor(node.status, 0.15 - (ringPulse * 0.1));
                    ctx.fill();

                    ctx.beginPath();
                    ctx.arc(nx, ny, 16, 0, Math.PI * 2);
                    ctx.fillStyle = getStatusColor(node.status, 0.2);
                    ctx.fill();
                }

                ctx.save();
                ctx.shadowColor = 'rgba(0,0,0,0.1)';
                ctx.shadowBlur = 10;
                ctx.shadowOffsetY = 5;

                ctx.beginPath();
                ctx.arc(nx, ny, isHovered ? 12 : 10, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();

                ctx.lineWidth = isHovered ? 3 : 2;
                ctx.strokeStyle = isHovered ? baseColor : '#000';
                ctx.stroke();
                ctx.restore();

                ctx.fillStyle = baseColor;
                if (node.type === 'db') {
                    const size = isHovered ? 8 : 6;
                    ctx.fillRect(nx - size / 2, ny - size / 2, size, size);
                } else {
                    ctx.beginPath();
                    ctx.arc(nx, ny, isHovered ? 5 : 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                const fontSize = isHovered ? 12 : 11;
                ctx.font = `bold ${fontSize}px JetBrains Mono`;
                ctx.textAlign = 'center';
                const text = node.label;
                const metrics = ctx.measureText(text);
                const textW = metrics.width;
                const padX = isHovered ? 12 : 6;
                const padY = isHovered ? 8 : 4;

                const labelY = ny + 25 + (isHovered ? 8 : 0);

                ctx.fillStyle = isHovered ? '#000000' : 'rgba(255, 255, 255, 0.95)';

                const bx = nx - textW / 2 - padX;
                const by = labelY - 10 - padY / 2;
                const bw = textW + padX * 2;
                const bh = 14 + padY;

                ctx.beginPath();
                ctx.roundRect(bx, by, bw, bh, 4);
                ctx.fill();

                if (!isHovered) {
                    ctx.lineWidth = 1;
                    ctx.strokeStyle = '#e4e4e7';
                    ctx.stroke();
                }

                ctx.fillStyle = isHovered ? '#ffffff' : '#333333';
                ctx.fillText(text, nx, labelY);
            });

            animId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <>
            {/* SEPARATOR */}
            <div className="w-full bg-black text-white py-3 overflow-hidden border-t border-b border-white/10">
                <div className="flex gap-12 whitespace-nowrap animate-marquee font-mono text-xs font-bold tracking-widest uppercase">
                    {Array(10).fill("SYSTEM MESH // LIVE DATA // AUTO SCALE // ").map((t, i) => (
                        <span key={i} className="opacity-80">{t}</span>
                    ))}
                </div>
            </div>

            {/* MAIN SECTION - Full Screen Flex Column */}
            <section id={SectionId.SKILLS} ref={containerRef} className="py-8 bg-zinc-50 relative overflow-hidden min-h-screen flex flex-col perspective-container">
                <div className="max-w-7xl mx-auto px-6 relative z-10 w-full flex-1 flex flex-col justify-between">

                    {/* TOP HEADER - Pushed to top */}
                    <div className={`w-full pt-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest block mb-2">(04) System Map</span>
                        <h2 className="text-4xl md:text-5xl font-bold text-black tracking-tight">How It All Connects</h2>
                    </div>

                    {/* MIDDLE GRAPH - Expanded to fill space */}
                    <div
                        className={`relative w-full flex-grow my-6 transition-opacity duration-1000 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
                        onMouseMove={handleContainerMouseMove}
                        onMouseLeave={handleContainerMouseLeave}
                        style={{
                            transform: `perspective(1200px) rotateX(${tilt.y * -4}deg) rotateY(${tilt.x * 4}deg)`,
                            transition: 'transform 0.1s ease-out',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        {/* CANVAS */}
                        <div className="absolute inset-0 bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden">
                            <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
                        </div>

                        {/* Floating Badge */}
                        <div
                            className="absolute top-6 right-6 bg-black text-white px-4 py-2 font-mono text-[10px] rounded shadow-lg pointer-events-none z-20"
                            style={{ transform: 'translateZ(20px)' }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                                <span>LIVE TOPOLOGY</span>
                            </div>
                            <div className="opacity-60">LATENCY: 12ms</div>
                        </div>

                    </div>

                    {/* BOTTOM CAPTION - Pushed to bottom */}
                    <div className={`w-full pb-8 text-center transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                        <p className="text-lg text-zinc-700 font-light italic max-w-2xl mx-auto">
                            "Data flows from users to servers through optimized highways, ensuring zero jams even at peak traffic."
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
};