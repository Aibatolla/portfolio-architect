import React, { useEffect, useRef } from 'react';

export const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  
  // Use Mutable Refs instead of State for 60fps performance without re-renders
  const mouse = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });

  useEffect(() => {
    // Disable on mobile/touch
    if (typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)) {
        return;
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      
      // Instant update for the dot
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
    };

    const onMouseDown = () => {
        if (ringRef.current) ringRef.current.classList.add('scale-75');
    };
    
    const onMouseUp = () => {
        if (ringRef.current) ringRef.current.classList.remove('scale-75');
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const loop = () => {
      // Linear interpolation (Lerp) for smooth lag
      const dx = mouse.current.x - ringPos.current.x;
      const dy = mouse.current.y - ringPos.current.y;
      
      ringPos.current.x += dx * 0.15;
      ringPos.current.y += dy * 0.15;

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0)`;
      }

      requestRef.current = requestAnimationFrame(loop);
    };
    
    requestRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  return (
    <>
      {/* Dot - Hardware Accelerated */}
      <div 
        ref={cursorRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-black rounded-full pointer-events-none z-[9999] mix-blend-difference will-change-transform"
        style={{ marginTop: '-3px', marginLeft: '-3px' }}
      />
      
      {/* Ring - Hardware Accelerated */}
      <div 
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 border border-zinc-500 rounded-full pointer-events-none z-[9998] mix-blend-difference flex items-center justify-center transition-transform duration-100 ease-out will-change-transform"
        style={{ marginTop: '-16px', marginLeft: '-16px' }}
      />
    </>
  );
};