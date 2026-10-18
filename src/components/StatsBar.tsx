import React from 'react';
import { Award, Zap, Gauge, Gift } from 'lucide-react';

interface StatsBarProps {
  totalSpins: number;
  totalWins: number;
  tokens: number;
  onAddTokens: () => void;
  spinPower: 'light' | 'normal' | 'strong' | 'turbo';
  onChangeSpinPower: (power: 'light' | 'normal' | 'strong' | 'turbo') => void;
  activeTheme: 'yas' | 'gold' | 'cyber';
  onChangeTheme: (theme: 'yas' | 'gold' | 'cyber') => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  totalSpins,
  totalWins,
  tokens,
  onAddTokens,
  spinPower,
  onChangeSpinPower,
  activeTheme,
  onChangeTheme,
}) => {
  const winRate = totalSpins > 0 ? Math.round((totalWins / totalSpins) * 100) : 0;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 mt-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4 mb-4">
        {/* Token Quota */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Tours Disponibles</span>
            <span className="text-xl font-black text-amber-400">{tokens}</span>
          </div>
          <button
            onClick={onAddTokens}
            className="px-2 py-1 text-[11px] font-bold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors"
          >
            + Recharge
          </button>
        </div>

        {/* Total Spins */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Tours Lancés</span>
            <span className="text-xl font-black text-white">{totalSpins}</span>
          </div>
        </div>

        {/* Wins Count */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Lots Remportés</span>
            <span className="text-xl font-black text-emerald-400">{totalWins}</span>
          </div>
        </div>

        {/* Win Rate */}
        <div className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-400 block">Taux de Gain</span>
            <span className="text-xl font-black text-purple-400">{winRate}%</span>
          </div>
        </div>
      </div>

      {/* Settings Row (Speed + Theme) */}
      <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Spin Speed / Power */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-slate-400">
            <Gauge className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-medium">Force de rotation :</span>
          </div>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(
              [
                { id: 'light', label: 'Douce' },
                { id: 'normal', label: 'Normale' },
                { id: 'strong', label: 'Forte' },
                { id: 'turbo', label: 'Turbo' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                onClick={() => onChangeSpinPower(item.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  spinPower === item.id
                    ? 'bg-slate-800 text-cyan-400 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Wheel Skin / Theme */}
        <div className="flex items-center gap-2">
          <span className="font-medium text-slate-400">Thème visuel :</span>
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            {(
              [
                { id: 'yas', label: 'Yas Neon' },
                { id: 'gold', label: 'Casino Or' },
                { id: 'cyber', label: 'Cyberpunk' },
              ] as const
            ).map((th) => (
              <button
                key={th.id}
                onClick={() => onChangeTheme(th.id)}
                className={`px-2 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                  activeTheme === th.id
                    ? 'bg-slate-800 text-amber-300 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {th.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
