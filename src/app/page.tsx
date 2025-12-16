"use client";

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar,
  FaUsers,
  FaTrophy,
  FaClock,
  FaPlay,
  FaExclamationTriangle
} from 'react-icons/fa';
import { Button } from '@/components/ui/button';
import { SlotMachine } from '@/components/slot-machine';
import { ResultOverlay } from '@/components/result-overlay';
import { AdminPanel } from '@/components/admin-panel';
import { useLuckyDraw } from '@/hooks/use-lucky-draw';
import { useAudio } from '@/hooks/use-audio';

export default function LuckyDrawStage() {
  const {
    participants,
    winners,
    currentWinner,
    phase,
    settings,
    sessionId,
    stats,
    availableParticipants,
    startSpin,
    completeSpin,
    saveResult,
    undoLastWinner,
    importData,
    exportWinners,
    updateSettings,
    resetSession,
    setPhase,
  } = useLuckyDraw();

  const {
    settings: audioSettings,
    audioUnlocked,
    unlockAudio,
    playBgm,
    playSfx,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
  } = useAudio();

  const [showStartPrompt, setShowStartPrompt] = useState(true);
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdownValue, setCountdownValue] = useState(3);
  const [flashScreen, setFlashScreen] = useState(false);

  const handleStartEvent = useCallback(async () => {
    await unlockAudio();
    setShowStartPrompt(false);
  }, [unlockAudio]);

  const triggerSpinSequence = useCallback(() => {
    if (phase !== 'idle' || availableParticipants.length === 0) return;

    setIsCountingDown(true);
    setCountdownValue(3);
    playSfx('click'); // Or a preparation sound
  }, [phase, availableParticipants.length, playSfx]);

  // Handle Countdown Logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCountingDown) {
      if (countdownValue > 0) {
        playSfx('click'); // Tick sound
        timer = setTimeout(() => {
          setCountdownValue(prev => prev - 1);
        }, 1000); // 1 second intervals
      } else {
        // Countdown finished, start actual spin
        setIsCountingDown(false);
        playBgm('spin');
        startSpin();
      }
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdownValue, playSfx, playBgm, startSpin]);

  const handleSpinComplete = useCallback(() => {
    playBgm('idle');
    playSfx('win');
    setFlashScreen(true);
    completeSpin();
    setTimeout(() => setFlashScreen(false), 500); // Reset flash
  }, [playBgm, playSfx, completeSpin]);

  const handleSave = useCallback(() => {
    saveResult();
  }, [saveResult]);

  const handleUndo = useCallback(() => {
    setPhase('idle');
  }, [setPhase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'idle' && !showStartPrompt && !isCountingDown) {
        e.preventDefault();
        triggerSpinSequence();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, showStartPrompt, isCountingDown, triggerSpinSequence]);

  const isDisabled = phase !== 'idle' || availableParticipants.length === 0 || isCountingDown;

  return (
    <div className="relative min-h-screen overflow-hidden noise-overlay">
      {/* Background with Flash Effect */}
      <div className={`fixed inset-0 bg-gradient-to-br from-orange-400 via-amber-300 to-yellow-200 transition-colors duration-200 ${flashScreen ? 'brightness-150 saturate-150' : ''}`} />

      {/* Decorative Flares */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-white/30 rounded-full blur-[120px] mix-blend-overlay" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[100px] mix-blend-multiply" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header - Keep it clean, minimal visual noise */}
        <header className="relative py-6 px-8 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 group">
              <div className="w-14 h-14 rounded-2xl bg-white/50 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/60 transition-transform group-hover:scale-110 duration-300">
                <FaStar className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <h1 className="font-sans text-2xl font-black text-red-700 tracking-wider uppercase drop-shadow-sm">
                  Quay Số Trúng Thưởng
                </h1>
                <p className="text-xs text-red-800/50 font-mono font-bold tracking-[0.2em]">{sessionId}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <StatBadge icon={FaTrophy} label="Đã trúng" value={stats.won} color="red" />
              <StatBadge icon={FaClock} label="Còn lại" value={stats.remaining} color="amber" />
            </div>
          </div>
        </header>

        {/* Main Stage Area - The Focus */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 relative">

          {/* Main Content Container */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-[1400px] flex flex-col items-center gap-16"
          >
            {/* Slot Machine Display */}
            <div className="relative z-10 transform scale-105 md:scale-110 transition-transform duration-500">
              <SlotMachine
                participant={currentWinner}
                phase={phase}
                allParticipants={participants}
                onSpinComplete={handleSpinComplete}
                spinDuration={settings.spinDuration}
                playSfx={playSfx}
              />
            </div>

            {/* Controls & CTA Area */}
            <div className="relative z-20 flex flex-col items-center">
              {availableParticipants.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl glass-card text-center max-w-lg mx-auto"
                >
                  <FaExclamationTriangle className="w-12 h-12 text-red-500 animate-bounce" />
                  <p className="text-xl text-red-700 font-bold">
                    {participants.length === 0
                      ? 'Chưa có dữ liệu. Vui lòng import danh sách.'
                      : 'Tất cả đã trúng thưởng! Sự kiện kết thúc.'}
                  </p>
                </motion.div>
              ) : (
                <div className="relative group">
                  {/* Huge CTA Button */}
                  <motion.div
                    whileHover={!isDisabled ? { scale: 1.05 } : {}}
                    whileTap={!isDisabled ? { scale: 0.95 } : {}}
                    animate={isCountingDown ? { scale: 0.9, opacity: 0.5 } : {}}
                  >
                    <Button
                      onClick={triggerSpinSequence}
                      disabled={isDisabled}
                      className={`
                        relative w-80 h-32 md:w-96 md:h-36 rounded-full
                        text-5xl font-black tracking-widest uppercase
                        bg-gradient-to-b from-amber-400 via-orange-500 to-red-600
                        hover:from-amber-300 hover:via-orange-400 hover:to-red-500
                        disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed
                        border-4 border-white/40 shadow-[0_20px_60px_rgba(255,60,0,0.4),inset_0_2px_20px_rgba(255,255,255,0.4)]
                        text-white
                        transition-all duration-300
                        ${!isDisabled && !isCountingDown ? 'animate-pulse-glow hover:shadow-[0_30px_80px_rgba(255,60,0,0.6)]' : ''}
                      `}
                    >
                      <span className="relative z-10 drop-shadow-md flex items-center justify-center gap-4">
                        {isCountingDown ? 'CHUẨN BỊ...' : 'QUAY NGAY'}
                      </span>

                      {/* Shine Effect */}
                      {!isDisabled && !isCountingDown && (
                        <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-light-sweep" />
                        </div>
                      )}
                    </Button>
                  </motion.div>

                  {/* Keyboard Hint */}
                  {!isCountingDown && !isDisabled && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-sm text-red-900/40 font-bold tracking-wide uppercase whitespace-nowrap"
                    >
                      Nhấn <kbd className="px-2 py-0.5 bg-white/40 border border-white/60 rounded text-red-800 mx-1 shadow-sm font-sans mx-1">Space</kbd> để quay
                    </motion.p>
                  )}
                </div>
              )}
            </div>
          </motion.div>

          {/* Countdown Overlay */}
          <AnimatePresence>
            {isCountingDown && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-sm"
              >
                <div className="relative">
                  <motion.div
                    key={countdownValue}
                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                    animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                    exit={{ scale: 2, opacity: 0 }}
                    transition={{ duration: 0.5, type: "spring", stiffness: 300 }}
                    className="font-sans font-black text-[200px] md:text-[300px] leading-none text-transparent bg-clip-text bg-gradient-to-br from-red-600 to-orange-500 drop-shadow-2xl"
                  >
                    {countdownValue}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="py-6 px-8 text-center relative z-10 flex justify-between items-end opacity-60 hover:opacity-100 transition-opacity">
          <div className="text-left">
            <p className="text-xs font-bold text-red-900/40 uppercase tracking-widest">Powered by</p>
            <p className="text-sm font-black text-red-900/60">ORCHIDS TECH</p>
          </div>
          <p className="text-xs text-red-900/30 font-medium">
            Lucky Draw System v2.0 | Pro Event Edition
          </p>
        </footer>
      </div>

      <ResultOverlay
        isVisible={phase === 'result'}
        winner={currentWinner}
        onSave={handleSave}
        onUndo={handleUndo}
        playSfx={playSfx}
      />

      <AdminPanel
        settings={settings}
        onSettingsChange={updateSettings}
        participants={participants}
        winners={winners}
        onImport={importData}
        onExport={exportWinners}
        onReset={resetSession}
        audioSettings={audioSettings}
        onBgmVolumeChange={setBgmVolume}
        onSfxVolumeChange={setSfxVolume}
        onToggleMute={toggleMute}
      />

      <AnimatePresence>
        {showStartPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative flex flex-col items-center gap-12 p-16 max-w-3xl text-center"
            >
              <div>
                <motion.div
                  className="w-48 h-48 mx-auto mb-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-[0_20px_60px_rgba(255,80,0,0.3)] border-8 border-white"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <FaStar className="w-24 h-24 text-white drop-shadow-md" />
                </motion.div>

                <h1 className="font-sans text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-600 mb-6 drop-shadow-sm uppercase tracking-tight">
                  Sẵn Sàng
                  <br />
                  <span className="text-orange-500">Quay Số?</span>
                </h1>
              </div>

              <Button
                onClick={handleStartEvent}
                size="lg"
                className="
                  px-20 py-10 text-3xl font-black tracking-widest
                  bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 
                  hover:from-orange-400 hover:via-red-400 hover:to-orange-400 
                  rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.4)]
                  border-4 border-white text-white
                  group relative overflow-hidden
                  hover:scale-105 transition-transform duration-300
                "
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-[shine_1s_infinite]" />
                <span className="relative flex items-center gap-4">
                  <FaPlay className="w-8 h-8" />
                  BẮT ĐẦU
                </span>
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatBadge({
  icon: Icon,
  label,
  value,
  color
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  color: 'orange' | 'amber' | 'red'
}) {
  const colorClasses = {
    orange: 'text-orange-700',
    amber: 'text-amber-700',
    red: 'text-red-700',
  };

  const bgClasses = {
    orange: 'bg-orange-100/50 border-orange-200',
    amber: 'bg-amber-100/50 border-amber-200',
    red: 'bg-red-100/50 border-red-200',
  };

  return (
    <div className={`flex items-center gap-3 px-5 py-3 rounded-xl backdrop-blur-sm border ${bgClasses[color]}`}>
      <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
      <div className="flex flex-col items-start leading-none">
        <span className="text-[10px] text-slate-500 uppercase font-black mb-1">{label}</span>
        <span className={`font-sans font-black text-xl ${colorClasses[color]}`}>{value}</span>
      </div>
    </div>
  );
}