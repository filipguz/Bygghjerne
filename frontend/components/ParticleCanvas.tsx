"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}

const COUNT = 70;
const MAX_DIST = 155;
const SPEED = 0.32;

export default function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf: number;
    const particles: Particle[] = [];

    function setup() {
      canvas!.width = canvas!.offsetWidth;
      canvas!.height = canvas!.offsetHeight;
      particles.length = 0;
      for (let i = 0; i < COUNT; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = SPEED * (0.5 + Math.random() * 0.8);
        particles.push({
          x: Math.random() * canvas!.width,
          y: Math.random() * canvas!.height,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1.2 + Math.random() * 1.8,
        });
      }
    }

    function tick() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.22;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.strokeStyle = `rgba(147, 183, 255, ${alpha})`;
            ctx!.lineWidth = 0.7;
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        const glow = ctx!.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        glow.addColorStop(0, "rgba(255, 94, 61, 0.45)");
        glow.addColorStop(1, "rgba(255, 94, 61, 0)");
        ctx!.fillStyle = glow;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r * 5, 0, Math.PI * 2);
        ctx!.fill();

        ctx!.fillStyle = "rgba(255, 120, 80, 0.9)";
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -20) p.x = w + 20;
        else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        else if (p.y > h + 20) p.y = -20;
      }

      raf = requestAnimationFrame(tick);
    }

    setup();
    tick();

    const onResize = () => setup();
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return <canvas ref={ref} className="absolute inset-0 w-full h-full" />;
}
