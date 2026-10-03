"use client";

import { useEffect, useRef } from "react";

/** Campo de pontos em arco do hero original (template_files/saved_resource.html). Usado só nas telas de acesso. */
export function HeroCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let time = 0;
    let frame = 0;
    const spacing = 6;
    const dotSize = 5.5;

    function resizeCanvas() {
      width = canvas!.width = window.innerWidth;
      height = canvas!.height = window.innerHeight;
    }

    function drawField() {
      ctx!.fillStyle = "#030303";
      ctx!.fillRect(0, 0, width, height);
      time += 0.012;

      const centerX = width / 2;
      const archPeakY = height * 0.32;
      const archWidth = width * 1.48;
      const archHeight = height * 0.72;

      ctx!.globalCompositeOperation = "lighter";

      for (let x = 0; x < width; x += spacing) {
        const normX = (x - centerX) / (archWidth / 2);
        const curveY = archPeakY + normX * normX * archHeight;

        for (let y = 0; y < height; y += spacing) {
          const distanceToCurve = Math.abs(y - curveY);
          const thickness = 128 + (1 - Math.abs(normX)) * 82;

          if (distanceToCurve < thickness) {
            let intensity = 1 - distanceToCurve / thickness;
            const waveX = Math.sin(x * 0.014 + time);
            const waveY = Math.cos(y * 0.018 + time * 1.15);
            intensity = intensity * 0.72 + waveX * waveY * 0.24 * intensity;
            intensity *= Math.max(0, 1 - Math.pow(Math.abs(normX), 2.3));

            if (intensity > 0.025) {
              let r = Math.min(255, 102 * intensity + 156 * Math.pow(intensity, 2));
              let g = Math.min(255, 44 * intensity + 198 * Math.pow(intensity, 3));
              let b = Math.min(255, 12 * intensity + 76 * Math.pow(intensity, 4));

              if (intensity > 0.72) {
                const coreBoost = (intensity - 0.72) * 3.5;
                r = Math.min(255, r + 140 * coreBoost);
                g = Math.min(255, g + 132 * coreBoost);
                b = Math.min(255, b + 118 * coreBoost);
              }

              ctx!.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
              ctx!.fillRect(x, y, dotSize * intensity, dotSize * intensity);
            }
          }
        }
      }

      ctx!.globalCompositeOperation = "source-over";
      if (!reduceMotion) frame = requestAnimationFrame(drawField);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawField();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
