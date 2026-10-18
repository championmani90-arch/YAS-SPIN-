import React, { useEffect, useRef, useState, useCallback } from 'react';
import { WheelSegment } from '../types';
import { soundEngine } from '../utils/audio';

interface SpinWheelProps {
  segments: WheelSegment[];
  isSpinning: boolean;
  onSpinStart: () => void;
  onSpinComplete: (winningSegment: WheelSegment) => void;
  theme?: 'yas' | 'gold' | 'cyber';
  spinPower?: 'light' | 'normal' | 'strong' | 'turbo';
}

export const SpinWheel: React.FC<SpinWheelProps> = ({
  segments,
  isSpinning,
  onSpinStart,
  onSpinComplete,
  theme = 'yas',
  spinPower = 'normal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Angle in radians
  const currentAngleRef = useRef<number>(0);
  const targetAngleRef = useRef<number>(0);
  const startAngleRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef<number>(4500);
  const animFrameIdRef = useRef<number | null>(null);
  
  // Needle deflection state for physical flapper animation (-10 to +10 degrees)
  const [needleDeflection, setNeedleDeflection] = useState<number>(0);
  const lastPegIndexRef = useRef<number>(-1);
  const isSpinningInternalRef = useRef<boolean>(false);
  const winningSegmentRef = useRef<WheelSegment | null>(null);

  // Drag to spin tracking
  const isDraggingRef = useRef<boolean>(false);
  const dragStartAngleRef = useRef<number>(0);
  const dragLastAngleRef = useRef<number>(0);
  const dragVelocityRef = useRef<number>(0);
  const dragLastTimeRef = useRef<number>(0);

  const numSegments = segments.length;
  const sliceAngle = (2 * Math.PI) / (numSegments || 1);

  // Pick target based on probability weights
  const selectWinningSegment = useCallback((): { segment: WheelSegment; index: number } => {
    const totalWeight = segments.reduce((sum, s) => sum + Math.max(1, s.weight || 1), 0);
    let rand = Math.random() * totalWeight;
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      const w = Math.max(1, seg.weight || 1);
      if (rand < w) {
        return { segment: seg, index: i };
      }
      rand -= w;
    }
    return { segment: segments[0], index: 0 };
  }, [segments]);

  // Launch spin sequence
  const spin = useCallback(() => {
    if (isSpinningInternalRef.current || segments.length === 0) return;
    
    isSpinningInternalRef.current = true;
    onSpinStart();
    soundEngine.playSpinStart();

    const { segment, index: winnerIndex } = selectWinningSegment();
    winningSegmentRef.current = segment;

    // The pointer is at 12 o'clock = -Math.PI / 2 (or 3*PI/2)
    // To have slice i under the pointer, (currentAngle + offset) % (2PI) must match
    // Slice i covers: [i * sliceAngle, (i + 1) * sliceAngle]
    // Center of slice i: i * sliceAngle + sliceAngle / 2
    // With pointer at 1.5 * Math.PI:
    // pointerAngle = 3*PI/2 - (currentAngle % 2PI)
    // Let's randomize landing position inside slice (avoid hitting exact boundary peg)
    const paddingMargin = sliceAngle * 0.15;
    const randomWithinSlice = paddingMargin + Math.random() * (sliceAngle - 2 * paddingMargin);
    
    // Determine rotations based on spin power
    let minRotations = 6;
    let baseDuration = 4800;
    if (spinPower === 'light') {
      minRotations = 4;
      baseDuration = 3800;
    } else if (spinPower === 'strong') {
      minRotations = 8;
      baseDuration = 5500;
    } else if (spinPower === 'turbo') {
      minRotations = 11;
      baseDuration = 6200;
    }

    // Pointer is at the top (angle = -PI/2 in standard cartesian, or 3*PI/2)
    const pointerOffset = 1.5 * Math.PI;
    const targetSliceAngle = winnerIndex * sliceAngle + randomWithinSlice;
    
    // Normalize current angle
    const start = currentAngleRef.current;
    startAngleRef.current = start;
    
    // Calculate total rotation
    const fullSpins = minRotations * 2 * Math.PI;
    const currentNormalized = start % (2 * Math.PI);
    let delta = (pointerOffset - targetSliceAngle - currentNormalized) % (2 * Math.PI);
    if (delta < 0) delta += 2 * Math.PI;
    
    targetAngleRef.current = start + fullSpins + delta;
    durationRef.current = baseDuration + Math.random() * 400;
    startTimeRef.current = performance.now();

    // Start RAF loop
    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(1, elapsed / durationRef.current);

      // Quintic ease out for super smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 4.5);
      const angle = startAngleRef.current + (targetAngleRef.current - startAngleRef.current) * easeOut;
      currentAngleRef.current = angle;

      // Peg detection for tick sound and needle flapper bounce
      // Each segment boundary has a peg at angle i * sliceAngle
      const currentWheelAngle = angle % (2 * Math.PI);
      const relativePointerAngle = (1.5 * Math.PI - currentWheelAngle + 4 * Math.PI) % (2 * Math.PI);
      const currentPegIndex = Math.floor(relativePointerAngle / sliceAngle);

      if (currentPegIndex !== lastPegIndexRef.current) {
        lastPegIndexRef.current = currentPegIndex;
        // Pitch shifts with speed (faster = higher pitch)
        const speed = (1 - progress);
        soundEngine.playTick(0.8 + speed * 0.6);
        
        // Needle deflects forward then springs back
        setNeedleDeflection(14 * Math.max(0.2, speed));
        setTimeout(() => setNeedleDeflection(0), 40);
      }

      draw();

      if (progress < 1) {
        animFrameIdRef.current = requestAnimationFrame(animate);
      } else {
        isSpinningInternalRef.current = false;
        setNeedleDeflection(0);
        draw();
        if (winningSegmentRef.current) {
          onSpinComplete(winningSegmentRef.current);
        }
      }
    };

    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
    }
    animFrameIdRef.current = requestAnimationFrame(animate);
  }, [segments, numSegments, sliceAngle, onSpinStart, onSpinComplete, selectWinningSegment, spinPower]);

  // Main draw function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const outerRadius = Math.min(centerX, centerY) - 16;
    const wheelRadius = outerRadius - 18;
    const hubRadius = Math.max(42, wheelRadius * 0.22);

    const rotation = currentAngleRef.current;

    // 1. Draw outer ambient glow
    const ambientGlow = ctx.createRadialGradient(centerX, centerY, wheelRadius * 0.7, centerX, centerY, outerRadius + 14);
    if (theme === 'yas') {
      ambientGlow.addColorStop(0, 'rgba(6, 182, 212, 0)');
      ambientGlow.addColorStop(0.85, 'rgba(6, 182, 212, 0.25)');
      ambientGlow.addColorStop(1, 'rgba(6, 182, 212, 0)');
    } else if (theme === 'gold') {
      ambientGlow.addColorStop(0, 'rgba(234, 179, 8, 0)');
      ambientGlow.addColorStop(0.85, 'rgba(234, 179, 8, 0.25)');
      ambientGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');
    } else {
      ambientGlow.addColorStop(0, 'rgba(168, 85, 247, 0)');
      ambientGlow.addColorStop(0.85, 'rgba(168, 85, 247, 0.25)');
      ambientGlow.addColorStop(1, 'rgba(168, 85, 247, 0)');
    }
    ctx.fillStyle = ambientGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius + 12, 0, Math.PI * 2);
    ctx.fill();

    // 2. Outer rim (Chunky metallic border)
    const rimGradient = ctx.createLinearGradient(centerX - outerRadius, centerY - outerRadius, centerX + outerRadius, centerY + outerRadius);
    if (theme === 'gold') {
      rimGradient.addColorStop(0, '#78350f');
      rimGradient.addColorStop(0.3, '#f59e0b');
      rimGradient.addColorStop(0.5, '#fef08a');
      rimGradient.addColorStop(0.7, '#d97706');
      rimGradient.addColorStop(1, '#451a03');
    } else if (theme === 'cyber') {
      rimGradient.addColorStop(0, '#3b0764');
      rimGradient.addColorStop(0.3, '#a855f7');
      rimGradient.addColorStop(0.5, '#e879f9');
      rimGradient.addColorStop(0.7, '#6b21a8');
      rimGradient.addColorStop(1, '#1e1b4b');
    } else {
      // Yas Blue & Gold
      rimGradient.addColorStop(0, '#0c2340');
      rimGradient.addColorStop(0.25, '#0284c7');
      rimGradient.addColorStop(0.5, '#38bdf8');
      rimGradient.addColorStop(0.75, '#0369a1');
      rimGradient.addColorStop(1, '#082f49');
    }

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.fillStyle = rimGradient;
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 6;
    ctx.fill();
    ctx.shadowColor = 'transparent';

    // Outer rim bevel ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius + 6, 0, Math.PI * 2);
    ctx.strokeStyle = theme === 'gold' ? '#ca8a04' : '#0284c7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // 3. Pegs / LED bulbs around the outer rim
    const totalPegs = numSegments * 2;
    const pegRadius = 4.5;
    const pegDistance = (outerRadius + wheelRadius) / 2;

    for (let p = 0; p < totalPegs; p++) {
      const pegAngle = (p * 2 * Math.PI) / totalPegs + (rotation * 0.4);
      const px = centerX + Math.cos(pegAngle) * pegDistance;
      const py = centerY + Math.sin(pegAngle) * pegDistance;

      // Peg active blink
      const isLit = (p + Math.floor(rotation * 4)) % 3 === 0;

      ctx.beginPath();
      ctx.arc(px, py, pegRadius, 0, Math.PI * 2);
      ctx.fillStyle = isLit
        ? (theme === 'gold' ? '#fffbeb' : '#e0f2fe')
        : (theme === 'gold' ? '#b45309' : '#0369a1');
      ctx.fill();

      // Mini golden/brass ring around each peg
      ctx.beginPath();
      ctx.arc(px, py, pegRadius + 1.2, 0, Math.PI * 2);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Draw Segments
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotation);

    segments.forEach((segment, i) => {
      const startAngle = i * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice background
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, startAngle, endAngle);
      ctx.closePath();

      // Radial highlight gradient for subtle rich 3D shading
      const segGrad = ctx.createRadialGradient(0, 0, hubRadius, 0, 0, wheelRadius);
      segGrad.addColorStop(0, segment.color);
      segGrad.addColorStop(1, adjustColorBrightness(segment.color, -16));

      ctx.fillStyle = segGrad;
      ctx.fill();

      // Divider line with gold/silver luxury edge
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Slice Content (Text & Icon)
      ctx.save();
      const midAngle = startAngle + sliceAngle / 2;
      ctx.rotate(midAngle);

      // Icon & Text placement
      const textColor = segment.textColor || '#ffffff';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Draw Icon at outer edge
      const iconDist = wheelRadius - 26;
      ctx.font = `${Math.min(22, Math.max(14, wheelRadius * 0.11))}px "Apple Color Emoji", "Segoe UI Emoji", sans-serif`;
      ctx.fillText(segment.icon || '🎁', iconDist, 0);

      // Draw Primary Label
      const labelDist = iconDist - 26;
      const fontSize = Math.min(15, Math.max(11, (wheelRadius / numSegments) * 1.8));
      ctx.font = `700 ${fontSize}px "Outfit", "Plus Jakarta Sans", sans-serif`;
      
      // Truncate label if too long for slice
      let labelText = segment.label;
      if (labelText.length > 18) {
        labelText = labelText.slice(0, 16) + '…';
      }
      ctx.fillText(labelText, labelDist, -5);

      // Draw Subtext (if exists)
      if (segment.subtext) {
        const subFontSize = Math.max(9, fontSize - 3);
        ctx.font = `500 ${subFontSize}px "Plus Jakarta Sans", sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
        let subText = segment.subtext;
        if (subText.length > 20) {
          subText = subText.slice(0, 18) + '…';
        }
        ctx.fillText(subText, labelDist, 10);
      }

      ctx.restore();
    });

    ctx.restore(); // Exit rotated wheel coordinate system

    // 5. Central Hub (Luxury 3D metallic medallion with YAS SPIN branding)
    ctx.save();
    ctx.translate(centerX, centerY);

    // Hub outer shadow
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius + 6, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();

    // Hub metallic rim
    const hubRimGrad = ctx.createLinearGradient(-hubRadius, -hubRadius, hubRadius, hubRadius);
    if (theme === 'gold') {
      hubRimGrad.addColorStop(0, '#fef08a');
      hubRimGrad.addColorStop(0.5, '#d97706');
      hubRimGrad.addColorStop(1, '#78350f');
    } else {
      hubRimGrad.addColorStop(0, '#38bdf8');
      hubRimGrad.addColorStop(0.5, '#0284c7');
      hubRimGrad.addColorStop(1, '#0f172a');
    }
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius, 0, Math.PI * 2);
    ctx.fillStyle = hubRimGrad;
    ctx.fill();

    // Hub center disc
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius - 5, 0, Math.PI * 2);
    ctx.fillStyle = '#0b1329';
    ctx.fill();

    // Glowing center ring
    ctx.beginPath();
    ctx.arc(0, 0, hubRadius - 7, 0, Math.PI * 2);
    ctx.strokeStyle = theme === 'gold' ? '#f59e0b' : '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Hub Brand Text "YAS SPIN"
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Top text: YAS
    ctx.font = `800 ${Math.max(14, hubRadius * 0.32)}px "Space Grotesk", "Outfit", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.letterSpacing = '1px';
    ctx.fillText('YAS', 0, -8);

    // Bottom text: SPIN or GO
    ctx.font = `700 ${Math.max(10, hubRadius * 0.22)}px "Outfit", sans-serif`;
    ctx.fillStyle = theme === 'gold' ? '#fbbf24' : '#38bdf8';
    ctx.fillText(isSpinningInternalRef.current ? '...' : 'SPIN', 0, 11);

    ctx.restore();

    // 6. Realistic Needle / Flapper at Top (12 o'clock)
    // Pointer points DOWN towards the center
    ctx.save();
    const pointerTopY = centerY - outerRadius - 10;
    const pointerTipY = centerY - wheelRadius + 8;
    const pointerBaseWidth = 26;

    ctx.translate(centerX, pointerTopY + 12);
    ctx.rotate((needleDeflection * Math.PI) / 180);

    // Needle drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.55)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetY = 4;

    // Draw Arrow / Pointer Body
    ctx.beginPath();
    ctx.moveTo(0, pointerTipY - pointerTopY - 12); // Needle tip pointing in
    ctx.lineTo(-pointerBaseWidth / 2, -6);
    ctx.lineTo(pointerBaseWidth / 2, -6);
    ctx.closePath();

    const pointerGrad = ctx.createLinearGradient(0, -6, 0, pointerTipY - pointerTopY);
    pointerGrad.addColorStop(0, '#dc2626'); // Vivid red
    pointerGrad.addColorStop(0.7, '#ef4444');
    pointerGrad.addColorStop(1, '#f87171');
    ctx.fillStyle = pointerGrad;
    ctx.fill();

    // Pointer metallic edge highlight
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Needle pivot fastener / golden bolt
    ctx.beginPath();
    ctx.arc(0, -3, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#fbbf24';
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.restore();

    ctx.restore();
  }, [segments, numSegments, sliceAngle, theme, needleDeflection]);

  // Initial draw & resize listener
  useEffect(() => {
    draw();
    const handleResize = () => draw();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [draw]);

  // Handle Drag / Touch Swipe to spin
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (isSpinningInternalRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    // Check if clicked in center hub: trigger instant spin!
    const distFromCenter = Math.sqrt(x * x + y * y);
    const hubRadius = (Math.min(rect.width, rect.height) / 2) * 0.25;
    if (distFromCenter <= hubRadius) {
      soundEngine.playClick();
      spin();
      return;
    }

    isDraggingRef.current = true;
    dragStartAngleRef.current = Math.atan2(y, x);
    dragLastAngleRef.current = dragStartAngleRef.current;
    dragLastTimeRef.current = performance.now();
    dragVelocityRef.current = 0;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDraggingRef.current || isSpinningInternalRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const angle = Math.atan2(y, x);
    const now = performance.now();

    let deltaAngle = angle - dragLastAngleRef.current;
    // Normalize delta across -PI / +PI
    if (deltaAngle > Math.PI) deltaAngle -= 2 * Math.PI;
    if (deltaAngle < -Math.PI) deltaAngle += 2 * Math.PI;

    const dt = Math.max(1, now - dragLastTimeRef.current);
    dragVelocityRef.current = deltaAngle / dt;

    currentAngleRef.current += deltaAngle;
    dragLastAngleRef.current = angle;
    dragLastTimeRef.current = now;

    draw();
  };

  const handlePointerUp = () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    // If dragged with enough angular velocity, launch spin
    if (Math.abs(dragVelocityRef.current) > 0.008) {
      spin();
    } else {
      draw();
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none">
      {/* Interactive Canvas */}
      <div className="relative group cursor-pointer max-w-[480px] w-full aspect-square flex items-center justify-center p-2">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full touch-none rounded-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.65)] transition-transform duration-200 active:scale-[0.99]"
        />

        {/* Central Overlay Button (accessible tap zone) */}
        <button
          onClick={spin}
          disabled={isSpinning || isSpinningInternalRef.current}
          aria-label="Faire tourner la roue"
          className="absolute z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center text-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity focus:opacity-100 outline-none"
        >
          <span className="sr-only">Lancer la roue</span>
        </button>
      </div>

      {/* Floating Spin Trigger CTA */}
      <div className="mt-5 flex flex-col items-center gap-3 w-full max-w-sm px-4">
        <button
          onClick={spin}
          disabled={isSpinning || isSpinningInternalRef.current}
          className={`w-full py-4 px-6 rounded-2xl font-black text-lg tracking-wide uppercase transition-all duration-300 shadow-xl flex items-center justify-center gap-3 ${
            isSpinning || isSpinningInternalRef.current
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/50'
              : 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:via-orange-400 hover:to-rose-500 text-white shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-[0.98] border border-amber-300/30 ring-4 ring-orange-500/20'
          }`}
        >
          {isSpinning || isSpinningInternalRef.current ? (
            <>
              <svg className="animate-spin h-6 w-6 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>La roue tourne...</span>
            </>
          ) : (
            <>
              <span className="text-2xl animate-bounce">⚡</span>
              <span>TOURNER LA ROUE</span>
              <span className="text-2xl animate-bounce">⚡</span>
            </>
          )}
        </button>
        <p className="text-xs text-slate-400 text-center font-medium">
          Cliquez sur le bouton ou faites glisser la roue directement !
        </p>
      </div>
    </div>
  );
};

// Color utility for subtle radial shading
function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  if (isNaN(num)) return hex;
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return `#${(
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  )
    .toString(16)
    .slice(1)}`;
}
