"use client"

import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  update: (canvasWidth: number, canvasHeight: number) => void;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

export function ParticleBackground({ className = '' }: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    // Check if window is available (SSR check)
    if (typeof window === 'undefined') return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas to full width/height
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Create particle factory function instead of a class
    const createParticle = (): Particle => {
      // Adjust distribution to have more particles near the top of the page
      const x = Math.random() * canvas.width;
      
      // Bias towards the top part of the screen for more particles near the header
      let y;
      if (Math.random() < 0.6) { // 60% chance to be in the top half
        y = Math.random() * (canvas.height * 0.5); // Top half of the screen
      } else {
        y = Math.random() * canvas.height; // Anywhere on the screen
      }
      
      const size = Math.random() * 3 + 0.8; // Slightly larger particles
      const speedX = Math.random() * 0.4 - 0.2; // Slightly slower movement
      const speedY = Math.random() * 0.4 - 0.2;
      
      // Create gradient colors from amber to orange
      const hue = Math.random() * 30 + 20; // 20-50 range (orange to amber)
      const saturation = Math.random() * 20 + 80; // 80-100%
      const lightness = Math.random() * 20 + 50; // 50-70%
      const color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.random() * 0.3 + 0.2})`;
      
      return {
        x,
        y,
        size,
        speedX,
        speedY,
        color,
        update(canvasWidth: number, canvasHeight: number) {
          this.x += this.speedX;
          this.y += this.speedY;
          
          // Wrap around edges instead of bouncing
          if (this.x < 0) this.x = canvasWidth;
          if (this.x > canvasWidth) this.x = 0;
          if (this.y < 0) this.y = canvasHeight;
          if (this.y > canvasHeight) this.y = 0;
        },
        draw(ctx: CanvasRenderingContext2D) {
          ctx.fillStyle = this.color;
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          ctx.fill();
        }
      };
    };
    
    // Create particles - more particles and concentrated toward the top
    const particlesArray: Particle[] = [];
    const baseParticleCount = Math.min(
      Math.max(Math.floor(window.innerWidth * window.innerHeight / 6000), 150), 
      350
    );
    
    for (let i = 0; i < baseParticleCount; i++) {
      particlesArray.push(createParticle());
    }
    
    // Animation loop with frame ID for proper cleanup
    let animationFrameId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update(canvas.width, canvas.height);
        particlesArray[i].draw(ctx);
      }
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 -z-10 opacity-70 ${className}`}
      aria-hidden="true"
    />
  );
}