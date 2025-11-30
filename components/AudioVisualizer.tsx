'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
  theme?: string;
}

const THEME_COLORS: Record<string, { primary: number[]; secondary: number[]; tertiary: number[] }> = {
  default: {
    primary: [139, 92, 246],    // purple
    secondary: [126, 34, 206],  // violet
    tertiary: [88, 28, 135],    // dark purple
  },
  ocean: {
    primary: [59, 130, 246],    // blue
    secondary: [6, 182, 212],   // cyan
    tertiary: [14, 116, 144],   // dark cyan
  },
  sunset: {
    primary: [249, 115, 22],    // orange
    secondary: [239, 68, 68],   // red
    tertiary: [153, 27, 27],    // dark red
  },
  forest: {
    primary: [34, 197, 94],     // green
    secondary: [16, 185, 129],  // emerald
    tertiary: [6, 95, 70],      // dark emerald
  },
  midnight: {
    primary: [100, 116, 139],   // slate
    secondary: [99, 102, 241],  // indigo
    tertiary: [49, 46, 129],    // dark indigo
  },
};

export default function AudioVisualizer({ analyser, isPlaying, theme = 'default' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const phaseRef = useRef(0);

  const colors = THEME_COLORS[theme] || THEME_COLORS.default;

  useEffect(() => {
    if (!canvasRef.current || !analyser) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isPlaying) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        animationFrameRef.current = requestAnimationFrame(draw);
        return;
      }

      analyser.getByteFrequencyData(dataArray);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      phaseRef.current += 0.005;

      const avgValue = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;

      ctx.filter = 'blur(12px)';

      const numWaves = 3;
      for (let wave = 0; wave < numWaves; wave++) {
        const waveY = canvas.height * (0.3 + wave * 0.25);
        const amplitude = 100 - wave * 25;
        const frequency = 0.003 + wave * 0.0008;
        const alpha = 0.1 - wave * 0.025;

        ctx.beginPath();

        for (let x = 0; x < canvas.width; x += 4) {
          const dataIndex = Math.floor((x / canvas.width) * bufferLength);
          const value = dataArray[dataIndex] / 255;

          const noise = Math.sin(x * 0.008 + phaseRef.current * 1.5) * 8;
          const baseY = waveY + Math.sin(x * frequency + phaseRef.current) * amplitude * 0.3 + noise;
          const y = baseY + value * amplitude * 1.8;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.lineTo(canvas.width, waveY);
        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, waveY - amplitude, 0, canvas.height);
        gradient.addColorStop(0, `rgba(${colors.primary.join(',')}, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `rgba(${colors.secondary.join(',')}, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(${colors.tertiary.join(',')}, ${alpha * 0.1})`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.filter = 'none';

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const glowRadius = 200 + avgValue * 100;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glowGradient.addColorStop(0, `rgba(${colors.primary.join(',')}, ${avgValue * 0.08})`);
      glowGradient.addColorStop(0.5, `rgba(${colors.secondary.join(',')}, ${avgValue * 0.04})`);
      glowGradient.addColorStop(1, `rgba(${colors.tertiary.join(',')}, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [analyser, isPlaying, colors]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1200}
        height={1200}
        className="w-full h-full opacity-60"
        style={{ mixBlendMode: 'screen' }}
      />
    </div>
  );
}