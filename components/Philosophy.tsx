import React, { useEffect, useRef } from 'react';

// Enhanced Interactive Keyword Component
const InteractiveText = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <span className={`inline-block transition-all duration-300 cursor-default hover:scale-110 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] ${className}`}>
        {children}
    </span>
);

export const Philosophy: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.2 });

        if (containerRef.current) {
            const elements = containerRef.current.querySelectorAll('.reveal-blur');
            elements.forEach(el => observer.observe(el));
        }
        return () => observer.disconnect();
    }, []);

    // CANVAS ANIMATION
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

        const particles: { x: number, y: number, s: number, vx: number, vy: number }[] = [];
        for (let i = 0; i < 100; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                s: Math.random() * 2,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5
            });
        }

        let animId: number;
        const render = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';

            particles.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.s, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw connecting lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
            ctx.lineWidth = 1;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 100) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            animId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animId);
        };
    }, []);

    return (
        <section ref={containerRef} className="py-32 bg-zinc-900 text-white relative overflow-hidden">

            {/* Canvas Background */}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 relative z-10 text-center md:text-left">

                <span className="block font-mono text-xs text-blue-400 uppercase tracking-widest mb-8 reveal-blur delay-100">
            // The Mindset
                </span>

                {/* Text Animation: Shimmer/Gradient Flow */}
                <h2 className="text-4xl md:text-6xl font-bold leading-tight mb-12 reveal-blur delay-200">
                    I am the bridge between<br />
                    <InteractiveText className="text-zinc-500 hover:text-red-500">Chaos</InteractiveText> and <InteractiveText className="text-white font-bold hover:text-blue-500">Order</InteractiveText>.
                </h2>

                <div className="space-y-8 text-lg md:text-xl text-zinc-400 font-light leading-relaxed">
                    <p className="reveal-blur delay-300">
                        Code is not just syntax; it is the infrastructure of modern life. When you swipe a card, book a flight, or send a message, you are trusting a system to work instantly and securely.
                    </p>

                    <p className="reveal-blur delay-400">
                        I don't just fix bugs. I architect <InteractiveText className="text-white font-bold">trust</InteractiveText>.
                    </p>

                    <p className="reveal-blur delay-500">
                        My job is to be <InteractiveText>invisible</InteractiveText>. If I do my job right, you never notice I was there. The app just opens. The payment just goes through. The data is just safe.
                        <br /><br />
                        <span className="text-white italic">Silence is the sound of a perfect system.</span>
                    </p>
                </div>

                <div className="mt-16 reveal-blur delay-500">
                    <div className="h-px w-24 bg-blue-500 mx-auto md:mx-0"></div>
                </div>

            </div>
        </section>
    );
};