import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CursorEffects() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const cursorPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const cursor = cursorRef.current;
    const trail = trailRef.current;
    if (!cursor || !trail) return;

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseDown = () => {
      gsap.to(cursor, {
        scale: 0.8,
        duration: 0.1,
        ease: "power2.out"
      });
      
      // Create ripple effect
      const ripple = document.createElement('div');
      ripple.className = 'fixed pointer-events-none w-8 h-8 border-2 border-neon-pink rounded-full z-50';
      ripple.style.left = `${mousePos.current.x - 16}px`;
      ripple.style.top = `${mousePos.current.y - 16}px`;
      document.body.appendChild(ripple);
      
      gsap.fromTo(ripple, 
        { scale: 0, opacity: 1 },
        { 
          scale: 3, 
          opacity: 0, 
          duration: 0.6,
          ease: "power2.out",
          onComplete: () => ripple.remove()
        }
      );
    };

    const handleMouseUp = () => {
      gsap.to(cursor, {
        scale: 1,
        duration: 0.2,
        ease: "back.out(1.7)"
      });
    };

    const updateCursor = () => {
      // Smooth cursor following
      cursorPos.current.x += (mousePos.current.x - cursorPos.current.x) * 0.15;
      cursorPos.current.y += (mousePos.current.y - cursorPos.current.y) * 0.15;
      
      gsap.set(cursor, {
        x: cursorPos.current.x,
        y: cursorPos.current.y,
        xPercent: -50,
        yPercent: -50
      });
      
      gsap.set(trail, {
        x: cursorPos.current.x,
        y: cursorPos.current.y,
        xPercent: -50,
        yPercent: -50
      });
      
      requestAnimationFrame(updateCursor);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    updateCursor();

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <>
      {/* Cursor Trail */}
      <div
        ref={trailRef}
        className="fixed w-8 h-8 pointer-events-none z-50 mix-blend-difference"
        style={{
          background: 'radial-gradient(circle, rgba(255, 51, 102, 0.6) 0%, rgba(155, 93, 229, 0.4) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(2px)'
        }}
      />
      
      {/* Main Cursor */}
      <div
        ref={cursorRef}
        className="fixed w-4 h-4 pointer-events-none z-50 mix-blend-difference"
        style={{
          background: 'radial-gradient(circle, #ffffff 0%, #ff3366 100%)',
          borderRadius: '50%',
          boxShadow: '0 0 10px rgba(255, 51, 102, 0.8)'
        }}
      />
    </>
  );
}