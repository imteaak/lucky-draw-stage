"use client";

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Participant } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { FaCheck, FaUndo, FaTrophy } from 'react-icons/fa';

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

      const colors = ['#ea384c', '#f79009', '#fde047', '#ffffff'];

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
          shapes: ['star', 'circle'],
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
          className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-white/40 backdrop-blur-md"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-gradient-radial from-orange-200/60 via-yellow-100/40 to-transparent blur-3xl animate-pulse" />
          </div>

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: -30 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative z-10 flex flex-col items-center gap-12 max-w-6xl w-full"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 8 }}
              className="relative flex items-center gap-8"
            >
              <FaTrophy className="w-20 h-20 text-yellow-500 drop-shadow-xl animate-bounce" style={{ animationDuration: '2s' }} />

              <motion.h1
                className="font-sans text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 drop-shadow-sm uppercase tracking-tight"
                animate={{
                  textShadow: [
                    '0 4px 12px rgba(220,38,38,0.2)',
                    '0 8px 24px rgba(220,38,38,0.3)',
                    '0 4px 12px rgba(220,38,38,0.2)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                CHÚC MỪNG
              </motion.h1>

              <FaTrophy className="w-20 h-20 text-yellow-500 drop-shadow-xl animate-bounce" style={{ animationDuration: '2s', animationDelay: '0.1s' }} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full"
            >
              <WinnerCard label="Mã Khách Hàng" value={winner.customer_code} delay={0.5} />
              <WinnerCard label="Mã Trúng Thưởng" value={winner.prize_code} delay={0.6} isHighlight />
              <WinnerCard label="Tên Khách Hàng" value={winner.customer_name} delay={0.7} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-6 mt-4"
            >
              <Button
                onClick={onSave}
                size="lg"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold text-xl px-12 py-8 rounded-2xl shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all uppercase tracking-wider"
              >
                <FaCheck className="w-6 h-6 mr-3" />
                Lưu Kết Quả
              </Button>
              <Button
                onClick={onUndo}
                variant="outline"
                size="lg"
                className="border-2 border-red-200 text-red-700 bg-white/80 hover:bg-white font-bold text-xl px-10 py-8 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all uppercase tracking-wider"
              >
                <FaUndo className="w-6 h-6 mr-3" />
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
        relative p-8 rounded-3xl backdrop-blur-xl flex flex-col items-center justify-center text-center gap-4 h-full
        ${isHighlight
          ? 'bg-gradient-to-br from-white via-orange-50 to-white border-2 border-orange-200 shadow-[0_20px_50px_rgba(249,115,22,0.2)]'
          : 'bg-white/80 border border-white shadow-xl'
        }
      `}
    >
      <span className={`text-sm font-bold uppercase tracking-widest ${isHighlight ? 'text-orange-600' : 'text-slate-500'}`}>
        {label}
      </span>
      <span className={`
        font-sans font-black leading-tight break-words w-full
        ${isHighlight ? 'text-4xl md:text-5xl text-orange-600' : 'text-3xl md:text-4xl text-slate-800'}
      `}>
        {value}
      </span>

      {isHighlight && (
        <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-400/5 to-yellow-400/5" />
        </div>
      )}
    </motion.div>
  );
}