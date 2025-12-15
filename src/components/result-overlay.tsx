"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Check, Undo2, Trophy, Sparkles, Star } from 'lucide-react';

interface ResultOverlayProps {
  isVisible: boolean;
  winner: Participant | null;
  onSave: () => void;
  onUndo: () => void;
  playSfx: (type: 'win' | 'pop') => void;
}

export function ResultOverlay({ isVisible, winner, onSave, onUndo, playSfx }: ResultOverlayProps) {
  const confettiFiredRef = useRef(false);

  useEffect(() => {
    if (isVisible && winner && !confettiFiredRef.current) {
      confettiFiredRef.current = true;
      playSfx('win');
      
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      
      const colors = ['#007e3d', '#00ff7a', '#ffd700', '#ffffff', '#00d4aa', '#00a84f'];
      
      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.6 },
          colors,
          gravity: 1.2,
          scalar: 1.2,
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.6 },
          colors,
          gravity: 1.2,
          scalar: 1.2,
        });

        if (Date.now() < animationEnd) {
          requestAnimationFrame(frame);
        }
      };
      
      frame();
      
      setTimeout(() => {
        confetti({
          particleCount: 200,
          spread: 120,
          origin: { y: 0.5 },
          colors,
          gravity: 1,
          scalar: 1.4,
        });
        playSfx('pop');
      }, 500);
      
      setTimeout(() => {
        confetti({
          particleCount: 100,
          angle: 90,
          spread: 360,
          origin: { y: 0.4 },
          colors,
          shapes: ['star'],
          scalar: 1.5,
        });
      }, 1000);
    }
    
    if (!isVisible) {
      confettiFiredRef.current = false;
    }
  }, [isVisible, winner, playSfx]);

  return (
    <AnimatePresence>
      {isVisible && winner && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-br from-black/80 via-emerald-950/70 to-black/80 backdrop-blur-md"
          />
          
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] rounded-full bg-gradient-radial from-emerald-500/30 via-green-500/10 to-transparent blur-3xl animate-pulse" />
          </div>

          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 2] }}
              transition={{ 
                delay: i * 0.15, 
                duration: 2, 
                repeat: Infinity,
                repeatDelay: 1 
              }}
              className="absolute w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-300"
              style={{
                left: `${50 + 35 * Math.cos((i * 30 * Math.PI) / 180)}%`,
                top: `${50 + 35 * Math.sin((i * 30 * Math.PI) / 180)}%`,
              }}
            />
          ))}

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 15, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center gap-10 p-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 8 }}
              className="relative flex items-center gap-6"
            >
              <motion.div
                animate={{ 
                  rotate: [0, -15, 15, -10, 10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1
                }}
              >
                <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
              </motion.div>
              
              <motion.h1 
                className="font-['Be_Vietnam_Pro'] text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 drop-shadow-[0_0_30px_rgba(255,215,0,0.6)]"
                animate={{
                  textShadow: [
                    '0 0 20px rgba(255,215,0,0.6)',
                    '0 0 40px rgba(255,215,0,0.9)',
                    '0 0 20px rgba(255,215,0,0.6)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                CHÚC MỪNG
              </motion.h1>
              
              <motion.div
                animate={{ 
                  rotate: [0, 15, -15, 10, -10, 0],
                  scale: [1, 1.1, 1, 1.1, 1]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity,
                  repeatDelay: 1,
                  delay: 0.5
                }}
              >
                <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]" />
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col md:flex-row items-center gap-6 md:gap-10"
            >
              <WinnerCard label="Mã Khách Hàng" value={winner.customer_code} delay={0.5} />
              <WinnerCard label="Mã Trúng Thưởng" value={winner.prize_code} delay={0.6} isHighlight />
              <WinnerCard label="Tên Khách Hàng" value={winner.customer_name} delay={0.7} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-4 mt-4"
            >
              <Button
                onClick={onSave}
                size="lg"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-[0_0_30px_rgba(0,126,61,0.5)] hover:shadow-[0_0_40px_rgba(0,126,61,0.7)] transition-all"
              >
                <Check className="w-6 h-6 mr-2" />
                Lưu Kết Quả
              </Button>
              <Button
                onClick={onUndo}
                variant="outline"
                size="lg"
                className="border-white/30 text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-xl"
              >
                <Undo2 className="w-6 h-6 mr-2" />
                Hoàn Tác
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WinnerCard({ label, value, delay, isHighlight }: { label: string; value: string; delay: number; isHighlight?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      className={`
        relative p-6 rounded-2xl glass-card
        ${isHighlight ? 'shadow-[0_0_40px_rgba(255,215,0,0.3)]' : ''}
      `}
    >
      <div className={`
        absolute inset-0 rounded-2xl
        ${isHighlight 
          ? 'bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20' 
          : 'bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5'
        }
      `} />
      
      <div className="relative flex flex-col items-center gap-2">
        <span className={`text-sm font-semibold uppercase tracking-widest ${isHighlight ? 'text-yellow-400' : 'text-emerald-400'}`}>
          {label}
        </span>
        <span className={`
          font-['Orbitron'] font-black text-3xl md:text-4xl
          ${isHighlight ? 'text-gold' : 'text-white text-glow'}
        `}>
          {value}
        </span>
      </div>
      
      {isHighlight && (
        <>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-sparkle" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '0.5s' }} />
          <div className="absolute top-1/2 -right-2 w-2 h-2 bg-yellow-400 rounded-full animate-sparkle" style={{ animationDelay: '1s' }} />
        </>
      )}
    </motion.div>
  );
}