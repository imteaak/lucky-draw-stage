"use client";

import { useCallback, useRef, useState, useEffect } from 'react';

interface AudioSettings {
  bgmVolume: number;
  sfxVolume: number;
  muted: boolean;
}

export function useAudio() {
  const [settings, setSettings] = useState<AudioSettings>({
    bgmVolume: 0.25,
    sfxVolume: 0.7,
    muted: false,
  });
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const spinBgmRef = useRef<HTMLAudioElement | null>(null);
  const sfxRefs = useRef<Map<string, HTMLAudioElement>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    bgmRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3');
    bgmRef.current.loop = true;
    bgmRef.current.volume = settings.bgmVolume;

    spinBgmRef.current = new Audio('https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3');
    spinBgmRef.current.loop = true;
    spinBgmRef.current.volume = settings.bgmVolume * 1.4;

    const sfxUrls = {
      click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3',
      tick: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      stop: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
      win: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
      pop: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3',
    };

    Object.entries(sfxUrls).forEach(([key, url]) => {
      const audio = new Audio(url);
      audio.volume = settings.sfxVolume;
      sfxRefs.current.set(key, audio);
    });

    return () => {
      bgmRef.current?.pause();
      spinBgmRef.current?.pause();
      sfxRefs.current.forEach(audio => audio.pause());
    };
  }, []);

  useEffect(() => {
    if (bgmRef.current) {
      bgmRef.current.volume = settings.muted ? 0 : settings.bgmVolume;
    }
    if (spinBgmRef.current) {
      spinBgmRef.current.volume = settings.muted ? 0 : settings.bgmVolume * 1.4;
    }
    sfxRefs.current.forEach(audio => {
      audio.volume = settings.muted ? 0 : settings.sfxVolume;
    });
  }, [settings]);

  const unlockAudio = useCallback(async () => {
    if (audioUnlocked) return;
    
    try {
      const silentContext = new AudioContext();
      await silentContext.resume();
      silentContext.close();
      
      if (bgmRef.current) {
        await bgmRef.current.play();
      }
      setAudioUnlocked(true);
    } catch (e) {
      console.log('Audio unlock failed:', e);
    }
  }, [audioUnlocked]);

  const playBgm = useCallback((type: 'idle' | 'spin') => {
    if (settings.muted) return;
    
    if (type === 'idle') {
      spinBgmRef.current?.pause();
      if (spinBgmRef.current) spinBgmRef.current.currentTime = 0;
      bgmRef.current?.play().catch(() => {});
    } else {
      bgmRef.current?.pause();
      spinBgmRef.current?.play().catch(() => {});
    }
  }, [settings.muted]);

  const stopBgm = useCallback(() => {
    bgmRef.current?.pause();
    spinBgmRef.current?.pause();
  }, []);

  const playSfx = useCallback((type: 'click' | 'tick' | 'stop' | 'win' | 'pop') => {
    if (settings.muted) return;
    
    const audio = sfxRefs.current.get(type);
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
    }
  }, [settings.muted]);

  const setBgmVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, bgmVolume: volume }));
  }, []);

  const setSfxVolume = useCallback((volume: number) => {
    setSettings(prev => ({ ...prev, sfxVolume: volume }));
  }, []);

  const toggleMute = useCallback(() => {
    setSettings(prev => ({ ...prev, muted: !prev.muted }));
  }, []);

  return {
    settings,
    audioUnlocked,
    unlockAudio,
    playBgm,
    stopBgm,
    playSfx,
    setBgmVolume,
    setSfxVolume,
    toggleMute,
  };
}
