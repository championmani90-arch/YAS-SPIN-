export type SegmentType = 'gift' | 'jackpot' | 'retry' | 'lose' | 'bonus' | 'neutral';

export interface WheelSegment {
  id: string;
  label: string;
  subtext?: string;
  icon: string; // Emoji or symbol
  color: string;
  textColor?: string;
  type: SegmentType;
  weight: number; // Probability weight (higher = more likely)
  rewardCodePrefix?: string;
  claimNote?: string;
}

export interface PresetWheel {
  id: string;
  name: string;
  description: string;
  category: 'yas_official' | 'giveaway' | 'decision' | 'party' | 'custom';
  badge: string;
  segments: WheelSegment[];
}

export interface SpinResult {
  id: string;
  timestamp: number;
  segment: WheelSegment;
  voucherCode?: string;
  isSecondChance?: boolean;
}

export interface WheelTheme {
  id: string;
  name: string;
  rimColor: string;
  pegColor: string;
  pointerColor: string;
  hubBg: string;
  glowColor: string;
}
