'use client';

import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  analyser: AnalyserNode | null;
  isPlaying: boolean;
}

export default function AudioVisualizer({ analyser, isPlaying }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const phaseRef = useRef(0);

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

      ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      phaseRef.current += 0.006;

      const avgValue = dataArray.reduce((a, b) => a + b, 0) / bufferLength / 255;

      ctx.filter = 'blur(8px)';

      const numWaves = 3;
      for (let wave = 0; wave < numWaves; wave++) {
        const waveY = canvas.height * (0.3 + wave * 0.25);
        const amplitude = 80 - wave * 20;
        const frequency = 0.002 + wave * 0.0005;
        const alpha = 0.08 - wave * 0.02;

        ctx.beginPath();

        for (let x = 0; x < canvas.width; x += 5) {
          const dataIndex = Math.floor((x / canvas.width) * bufferLength);
          const value = dataArray[dataIndex] / 255;

          const noise = Math.sin(x * 0.01 + phaseRef.current * 2) * 10;
          const baseY = waveY + Math.sin(x * frequency + phaseRef.current) * amplitude * 0.5 + noise;
          const y = baseY + value * amplitude * 0.8;

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
        gradient.addColorStop(0, `rgba(139, 92, 246, ${alpha * 0.6})`);
        gradient.addColorStop(0.5, `rgba(126, 34, 206, ${alpha * 0.4})`);
        gradient.addColorStop(1, `rgba(88, 28, 135, ${alpha * 0.1})`);

        ctx.fillStyle = gradient;
        ctx.fill();
      }

      ctx.filter = 'none';

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const glowRadius = 200 + avgValue * 100;
      const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
      glowGradient.addColorStop(0, `rgba(139, 92, 246, ${avgValue * 0.08})`);
      glowGradient.addColorStop(0.5, `rgba(126, 34, 206, ${avgValue * 0.04})`);
      glowGradient.addColorStop(1, 'rgba(88, 28, 135, 0)');

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
  }, [analyser, isPlaying]);

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
