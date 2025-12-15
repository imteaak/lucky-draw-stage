"use client";

import { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Users, Trophy, Clock, Play, AlertCircle } from 'lucide-react';
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

  const handleStartEvent = useCallback(async () => {
    await unlockAudio();
    setShowStartPrompt(false);
  }, [unlockAudio]);

  const handleSpin = useCallback(() => {
    if (phase !== 'idle' || availableParticipants.length === 0) return;
    
    playSfx('click');
    playBgm('spin');
    startSpin();
  }, [phase, availableParticipants.length, playSfx, playBgm, startSpin]);

  const handleSpinComplete = useCallback(() => {
    playBgm('idle');
    completeSpin();
  }, [playBgm, completeSpin]);

  const handleSave = useCallback(() => {
    saveResult();
  }, [saveResult]);

  const handleUndo = useCallback(() => {
    setPhase('idle');
  }, [setPhase]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && phase === 'idle' && !showStartPrompt) {
        e.preventDefault();
        handleSpin();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, handleSpin, showStartPrompt]);

  const isDisabled = phase !== 'idle' || availableParticipants.length === 0;

  return (
    <div className="relative min-h-screen overflow-hidden noise-overlay">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
      
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-emerald-500/10 to-transparent opacity-30 animate-light-sweep" />
      </div>

      {phase === 'spinning' && (
        <div className="fixed inset-0 pointer-events-none z-30">
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.8)]" />
        </div>
      )}

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="relative py-6 px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="font-['Orbitron'] text-2xl font-bold text-white tracking-wider">
                  QUAY SỐ TRÚNG THƯỞNG
                </h1>
                <p className="text-sm text-white/50 font-mono">{sessionId}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <StatBadge icon={Users} label="Tổng" value={stats.total} color="white" />
              <StatBadge icon={Trophy} label="Đã trúng" value={stats.won} color="emerald" />
              <StatBadge icon={Clock} label="Còn lại" value={stats.remaining} color="yellow" />
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </header>

        <main className="flex-1 flex flex-col items-center justify-center px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-6xl"
          >
            <SlotMachine
              participant={currentWinner}
              phase={phase}
              allParticipants={participants}
              onSpinComplete={handleSpinComplete}
              spinDuration={settings.spinDuration}
              playSfx={playSfx}
            />

            <div className="mt-16 flex flex-col items-center">
              {availableParticipants.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl glass-card"
                >
                  <AlertCircle className="w-12 h-12 text-yellow-400" />
                  <p className="text-xl text-white/70 text-center">
                    {participants.length === 0 
                      ? 'Chưa có dữ liệu. Vui lòng import danh sách tham gia.'
                      : 'Tất cả đã trúng thưởng! Chúc mừng!'}
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={isDisabled ? {} : { scale: 1.02 }}
                  whileTap={isDisabled ? {} : { scale: 0.98 }}
                >
                  <Button
                    onClick={handleSpin}
                    disabled={isDisabled}
                    className={`
                      relative px-16 py-8 text-2xl font-['Orbitron'] font-black tracking-widest
                      bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600
                      hover:from-emerald-500 hover:via-emerald-400 hover:to-emerald-500
                      disabled:opacity-50 disabled:cursor-not-allowed
                      rounded-2xl border-2 border-emerald-400/50
                      shadow-[0_0_40px_rgba(0,126,61,0.5)]
                      ${!isDisabled ? 'animate-pulse-glow' : ''}
                      transition-all duration-300
                    `}
                  >
                    <span className="flex items-center gap-4">
                      <Sparkles className="w-8 h-8" />
                      QUAY NGAY
                      <Sparkles className="w-8 h-8" />
                    </span>
                    
                    {!isDisabled && (
                      <div className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-light-sweep" />
                      </div>
                    )}
                  </Button>
                </motion.div>
              )}

              <p className="mt-4 text-sm text-white/30">
                Nhấn <kbd className="px-2 py-1 bg-white/10 rounded text-white/50">Space</kbd> để quay
              </p>
            </div>
          </motion.div>
        </main>

        <footer className="py-4 px-8 text-center">
          <p className="text-sm text-white/30">
            Hotline: 1900 xxxx | Lucky Draw System v1.0
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
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="flex flex-col items-center gap-8 p-12"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_60px_rgba(0,126,61,0.5)]">
                <Sparkles className="w-12 h-12 text-white" />
              </div>
              
              <h1 className="font-['Orbitron'] text-4xl md:text-5xl font-black text-white text-center">
                QUAY SỐ TRÚNG THƯỞNG
              </h1>
              
              <p className="text-white/60 text-center max-w-md">
                Nhấn nút bên dưới để bắt đầu sự kiện và kích hoạt âm thanh
              </p>
              
              <Button
                onClick={handleStartEvent}
                size="lg"
                className="px-12 py-6 text-xl font-bold bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-[0_0_30px_rgba(0,126,61,0.5)]"
              >
                <Play className="w-6 h-6 mr-3" />
                BẮT ĐẦU
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
  color: 'white' | 'emerald' | 'yellow' 
}) {
  const colorClasses = {
    white: 'text-white',
    emerald: 'text-emerald-400',
    yellow: 'text-yellow-400',
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-xl glass-card">
      <Icon className={`w-5 h-5 ${colorClasses[color]}`} />
      <div className="flex flex-col">
        <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
        <span className={`font-['Orbitron'] font-bold text-xl ${colorClasses[color]}`}>{value}</span>
      </div>
    </div>
  );
}
