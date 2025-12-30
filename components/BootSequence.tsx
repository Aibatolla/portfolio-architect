import React, { useState, useEffect } from 'react';

export const BootSequence: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // High-end smooth easing for progress
        const startTime = Date.now();
        const duration = 2000; // 2 seconds of elegant loading

        const frame = () => {
            const now = Date.now();
            const elapsed = now - startTime;
            let p = Math.min(1, elapsed / duration);
            
            // Ease Out Quart - very smooth deceleration
            p = 1 - Math.pow(1 - p, 4);

            setProgress(p * 100);

            if (p < 1) {
                requestAnimationFrame(frame);
            } else {
                setTimeout(() => {
                    setIsExiting(true);
                    setTimeout(onComplete, 800); 
                }, 200);
            }
        };
        requestAnimationFrame(frame);
    }, [onComplete]);

    return (
        <div 
            className={`
                fixed inset-0 z-[9999] bg-white flex flex-col items-center justify-center
                transition-all duration-1000 ease-[cubic-bezier(0.87,0,0.13,1)]
                ${isExiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}
            `}
        >
            <div className={`flex flex-col items-center gap-8 transition-all duration-700 ${isExiting ? 'scale-105 opacity-0' : 'scale-100 opacity-100'}`}>
                
                {/* Brand Name - Clean & Bold */}
                <h1 className="text-3xl md:text-4xl font-bold tracking-tighter text-black uppercase">
                    Akash Aibatolla
                </h1>

                {/* Container for Line & Percent */}
                <div className="flex flex-col items-center gap-3 w-64 md:w-80">
                    {/* The Prestige Line */}
                    <div className="w-full h-[1px] bg-zinc-100 relative overflow-hidden">
                        <div 
                            className="absolute inset-y-0 left-0 bg-black transition-none"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    
                    {/* Minimal Percent - Centered */}
                    <div className="font-mono text-[10px] text-zinc-400 font-medium">
                        {Math.floor(progress).toString().padStart(3, '0')}%
                    </div>
                </div>

            </div>
        </div>
    );
};