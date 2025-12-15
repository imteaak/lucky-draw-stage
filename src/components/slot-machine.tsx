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
      setDisplayValues([...shuffled, ...shuffled, ...shuffled]);
      
      let idx = 0;
      const animate = () => {
        const elapsed = performance.now() - startTimeRef.current;
        const baseInterval = 50;
        const slowdown = Math.min(elapsed / 3000, 1) * 150;
        
        idx = (idx + 1) % (shuffled.length * 3);
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
      
      setDisplayValues([value]);
      setCurrentIndex(0);
      
      setTimeout(() => {
        onStop();
      }, 100);
    }
  }, [shouldStop, value, onStop]);

  const displayValue = isSpinning && !shouldStop 
    ? displayValues[currentIndex] || value 
    : value;

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-semibold text-emerald-400 uppercase tracking-widest">
        {label}
      </span>
      <div className="relative overflow-hidden rounded-2xl glass-card p-1">
        <div 
          className={`
            relative w-[280px] h-[100px] flex items-center justify-center overflow-hidden rounded-xl
            ${isResult ? 'bg-gradient-to-br from-emerald-900/60 to-emerald-950/80' : 'bg-gradient-to-br from-slate-900/90 to-slate-950/95'}
            ${isResult ? 'shadow-[0_0_30px_rgba(0,126,61,0.6),inset_0_0_20px_rgba(0,255,122,0.1)]' : ''}
            transition-all duration-500
          `}
        >
          {isSpinning && !shouldStop && (
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/40 pointer-events-none z-10" />
          )}
          
          <motion.div
            key={displayValue}
            initial={isSpinning ? { y: -30, opacity: 0 } : false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ 
              duration: isSpinning ? 0.05 : 0.3,
              ease: isSpinning ? "linear" : "easeOut"
            }}
            className={`
              font-['Orbitron'] font-extrabold text-4xl md:text-5xl tracking-wider
              ${isResult ? 'text-emerald-300 text-glow' : 'text-white'}
              ${isSpinning && !shouldStop ? 'blur-[1px]' : ''}
            `}
          >
            {displayValue}
          </motion.div>

          {isSpinning && !shouldStop && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent animate-scanline" />
            </div>
          )}
        </div>
        
        <div className={`
          absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300
          ${isResult 
            ? 'shadow-[inset_0_0_0_3px_rgba(0,126,61,0.8),0_0_40px_rgba(0,126,61,0.4)]' 
            : 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
          }
        `} />
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
    }, 200);
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
    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10">
      <SlotColumn
        value={display.customer_code}
        label="Mã Khách Hàng"
        isSpinning={isSpinning}
        shouldStop={slot1Stopped}
        onStop={() => {}}
        allValues={allParticipants.map(p => p.customer_code)}
        isResult={isResult}
      />
      <SlotColumn
        value={display.prize_code}
        label="Mã Trúng Thưởng"
        isSpinning={isSpinning}
        shouldStop={slot2Stopped}
        onStop={() => {}}
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