"use client";

import { useState, useCallback, useRef } from 'react';
import { Participant, Winner, SpinPhase, DrawSettings } from '@/lib/types';
import { mockParticipants } from '@/lib/mock-data';

const DEFAULT_SETTINGS: DrawSettings = {
  avoidDuplicates: true,
  spinDuration: 4500,
  displayMode: 'fullscreen',
  bgmEnabled: true,
  sfxEnabled: true,
  bgmVolume: 0.25,
  sfxVolume: 0.7,
};

export function useLuckyDraw() {
  const [participants, setParticipants] = useState<Participant[]>(mockParticipants);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentWinner, setCurrentWinner] = useState<Participant | null>(null);
  const [phase, setPhase] = useState<SpinPhase>('idle');
  const [settings, setSettings] = useState<DrawSettings>(DEFAULT_SETTINGS);
  const [sessionId] = useState(() => `SESSION-${Date.now().toString(36).toUpperCase()}`);
  
  const lastWinnerRef = useRef<Winner | null>(null);

  const availableParticipants = settings.avoidDuplicates
    ? participants.filter(p => !winners.some(w => w.customer_code === p.customer_code))
    : participants;

  const stats = {
    total: participants.length,
    won: winners.length,
    remaining: availableParticipants.length,
  };

  const selectRandomWinner = useCallback((): Participant | null => {
    if (availableParticipants.length === 0) return null;
    const index = Math.floor(Math.random() * availableParticipants.length);
    return availableParticipants[index];
  }, [availableParticipants]);

  const startSpin = useCallback(() => {
    if (phase !== 'idle' || availableParticipants.length === 0) return false;
    
    const winner = selectRandomWinner();
    if (!winner) return false;
    
    setCurrentWinner(winner);
    setPhase('spinning');
    return true;
  }, [phase, availableParticipants.length, selectRandomWinner]);

  const completeSpin = useCallback(() => {
    setPhase('result');
  }, []);

  const saveResult = useCallback(() => {
    if (!currentWinner) return;
    
    const newWinner: Winner = {
      ...currentWinner,
      wonAt: new Date(),
      sessionId,
    };
    
    lastWinnerRef.current = newWinner;
    setWinners(prev => [...prev, newWinner]);
    setCurrentWinner(null);
    setPhase('idle');
  }, [currentWinner, sessionId]);

  const undoLastWinner = useCallback(() => {
    if (winners.length === 0) return;
    
    setWinners(prev => prev.slice(0, -1));
    lastWinnerRef.current = null;
  }, [winners.length]);

  const importData = useCallback((data: Participant[]) => {
    setParticipants(data);
    setWinners([]);
    setCurrentWinner(null);
    setPhase('idle');
  }, []);

  const exportWinners = useCallback((format: 'json' | 'csv') => {
    if (format === 'json') {
      return JSON.stringify(winners, null, 2);
    }
    
    const headers = ['customer_code', 'prize_code', 'customer_name', 'wonAt', 'sessionId'];
    const rows = winners.map(w => [
      w.customer_code,
      w.prize_code,
      w.customer_name,
      w.wonAt.toISOString(),
      w.sessionId,
    ].join(','));
    
    return [headers.join(','), ...rows].join('\n');
  }, [winners]);

  const updateSettings = useCallback((newSettings: Partial<DrawSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  const resetSession = useCallback(() => {
    setWinners([]);
    setCurrentWinner(null);
    setPhase('idle');
  }, []);

  return {
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
  };
}
