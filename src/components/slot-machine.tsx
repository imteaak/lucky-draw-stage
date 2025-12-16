"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Participant, SpinPhase } from '@/lib/types';

interface SlotColumnProps {
  value: string;
  label: string;
  isSpinning: boolean;
  shouldStop: boolean;
  onStop: () => void;
  allValues: string[];
  isResult: boolean;
}

function SlotColumn({ value, label, isSpinning, shouldStop, onStop, allValues, isResult }: SlotColumnProps) {
  const [displayValues, setDisplayValues] = useState<string[]>([value]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const hasStoppedRef = useRef(false);

  useEffect(() => {
    if (isSpinning && !shouldStop) {
      hasStoppedRef.current = false;
      startTimeRef.current = performance.now();

      const shuffled = [...allValues].sort(() => Math.random() - 0.5);
      setDisplayValues([...shuffled, ...shuffled, ...shuffled, ...shuffled]);

      let idx = 0;
      const animate = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const progress = Math.min(elapsed / 4000, 1);

        // Smooth easing function for deceleration
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const baseInterval = 30;
        const maxSlowdown = 200;
        const slowdown = easeOut * maxSlowdown;

        idx = (idx + 1) % (shuffled.length * 4);
        setCurrentIndex(idx);

        animationRef.current = setTimeout(() => {
          requestAnimationFrame(animate);
        }, baseInterval + slowdown);
      };

      animate();
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isSpinning, shouldStop, allValues]);

  useEffect(() => {
    if (shouldStop && !hasStoppedRef.current) {
      hasStoppedRef.current = true;
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }

      // Smooth deceleration before stopping
      let decelerateSteps = 0;
      const maxDecelerateSteps = 5;

      const decelerate = () => {
        if (decelerateSteps < maxDecelerateSteps) {
          const nextIdx = (currentIndex + 1) % displayValues.length;
          setCurrentIndex(nextIdx);
          decelerateSteps++;

          const delay = 50 + (decelerateSteps * 30); // Gradually slow down
          setTimeout(decelerate, delay);
        } else {
          // Final stop with the correct value
          setDisplayValues([value]);
          setCurrentIndex(0);

          setTimeout(() => {
            onStop();
          }, 150);
        }
      };

      decelerate();
    }
  }, [shouldStop, value, onStop, currentIndex, displayValues.length]);

  const displayValue = isSpinning && !shouldStop
    ? displayValues[currentIndex] || value
    : value;

  return (
    <div className="flex flex-col items-center gap-6">
      <span className="text-lg font-black text-red-700 uppercase tracking-widest bg-white/70 px-6 py-2 rounded-full border border-red-200 backdrop-blur-sm shadow-sm">
        {label}
      </span>
      <div
        className={`
          relative overflow-hidden rounded-3xl p-2 shadow-2xl transition-all duration-300
          ${isResult ? 'bg-gradient-to-br from-red-600 to-red-800 scale-110 z-10' : 'bg-gradient-to-br from-white to-slate-100 border border-white/60'}
        `}
      >
        <div
          className={`
            relative w-[340px] h-[160px] flex items-center justify-center overflow-hidden rounded-2xl
            ${isResult ? 'bg-transparent' : 'bg-transparent'}
          `}
        >
          {isSpinning && !shouldStop && (
            <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-transparent to-white/60 pointer-events-none z-10" />
          )}

          <motion.div
            key={displayValue}
            initial={isSpinning ? { y: -50, opacity: 0, scale: 0.9 } : { scale: 1 }}
            animate={isResult ? { scale: [1, 1.2, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] } : { y: 0, opacity: 1, scale: 1 }}
            transition={{
              duration: isSpinning ? 0.05 : 0.3,
              ease: "easeOut"
            }}
            className={`
              font-sans font-black text-5xl md:text-6xl tracking-tight text-center px-4 leading-tight
              ${isResult ? 'text-white drop-shadow-[0_4px_4px_rgba(0,0,0,0.3)]' : 'text-slate-900'}
              ${isSpinning && !shouldStop ? 'blur-[1px]' : ''}
              transition-all duration-200
            `}
          >
            {displayValue}
          </motion.div>

          {isSpinning && !shouldStop && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-orange-500/10 to-transparent animate-scanline" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface SlotMachineProps {
  participant: Participant | null;
  phase: SpinPhase;
  allParticipants: Participant[];
  onSpinComplete: () => void;
  spinDuration: number;
  playSfx: (type: 'tick' | 'stop') => void;
}

export function SlotMachine({
  participant,
  phase,
  allParticipants,
  onSpinComplete,
  spinDuration,
  playSfx
}: SlotMachineProps) {
  const [slot1Stopped, setSlot1Stopped] = useState(false);
  const [slot2Stopped, setSlot2Stopped] = useState(false);
  const [slot3Stopped, setSlot3Stopped] = useState(false);

  const stopSequenceRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (phase === 'spinning') {
      setSlot1Stopped(false);
      setSlot2Stopped(false);
      setSlot3Stopped(false);

      stopSequenceRef.current.forEach(t => clearTimeout(t));
      stopSequenceRef.current = [];

      const t1 = setTimeout(() => {
        setSlot1Stopped(true);
        playSfx('stop');
      }, spinDuration * 0.55);

      const t2 = setTimeout(() => {
        setSlot2Stopped(true);
        playSfx('stop');
      }, spinDuration * 0.75);

      const t3 = setTimeout(() => {
        setSlot3Stopped(true);
        playSfx('stop');
      }, spinDuration);

      stopSequenceRef.current = [t1, t2, t3];
    }

    return () => {
      stopSequenceRef.current.forEach(t => clearTimeout(t));
    };
  }, [phase, spinDuration, playSfx]);

  const handleSlot3Stop = useCallback(() => {
    setTimeout(() => {
      onSpinComplete();
    }, 400); // Increased delay for dramatic pause
  }, [onSpinComplete]);

  const isSpinning = phase === 'spinning';
  const isResult = phase === 'result';

  const defaultDisplay = {
    customer_code: '???',
    prize_code: '???',
    customer_name: '???',
  };

  const display = participant || defaultDisplay;

  return (
    <div className="flex flex-col xl:flex-row items-center justify-center gap-10 xl:gap-16">
      <SlotColumn
        value={display.customer_code}
        label="Mã Khách Hàng"
        isSpinning={isSpinning}
        shouldStop={slot1Stopped}
        onStop={() => { }}
        allValues={allParticipants.map(p => p.customer_code)}
        isResult={isResult}
      />
      <SlotColumn
        value={display.prize_code}
        label="Mã Trúng Thưởng"
        isSpinning={isSpinning}
        shouldStop={slot2Stopped}
        onStop={() => { }}
        allValues={allParticipants.map(p => p.prize_code)}
        isResult={isResult}
      />
      <SlotColumn
        value={display.customer_name}
        label="Tên Khách Hàng"
        isSpinning={isSpinning}
        shouldStop={slot3Stopped}
        onStop={handleSlot3Stop}
        allValues={allParticipants.map(p => p.customer_name)}
        isResult={isResult}
      />
    </div>
  );
}