export interface Participant {
  customer_code: string;
  prize_code: string;
  customer_name: string;
}

export interface Winner extends Participant {
  wonAt: Date;
  sessionId: string;
}

export interface DrawSettings {
  avoidDuplicates: boolean;
  spinDuration: number;
  displayMode: 'fullscreen' | 'windowed';
  bgmEnabled: boolean;
  sfxEnabled: boolean;
  bgmVolume: number;
  sfxVolume: number;
}

export type SpinPhase = 'idle' | 'spinning' | 'stopping' | 'result';
