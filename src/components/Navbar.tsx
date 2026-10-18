import React from 'react';
import { Volume2, VolumeX, Maximize2, Minimize2, History, Settings, Sparkles } from 'lucide-react';
import { PRESET_WHEELS } from '../utils/presets';
import { soundEngine } from '../utils/audio';

interface NavbarProps {
  currentPresetId: string;
  onSelectPreset: (presetId: string) => void;
  onOpenCustomizer: () => void;
  onOpenHistory: () => void;
  historyCount: number;
  isMuted: boolean;
  onToggleSound: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  tokens: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentPresetId,
  onSelectPreset,
  onOpenCustomizer,
  onOpenHistory,
  historyCount,
  isMuted,
  onToggleSound,
  isFullscreen,
  onToggleFullscreen,
  tokens,
}) => {
  return (
    <header className="w-full bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-3 sm:px-6 py-2.5">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-lg tracking-wider">
            Y
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-black text-base sm:text-lg tracking-tight text-white">
                YAS<span className="text-cyan-400">SPIN</span>
              </span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                PROMO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
              Roue de la Fortune & Tirage au Sort
            </p>
          </div>
        </div>

        {/* Center Preset Selector */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1 rounded-xl border border-slate-800">
          {PRESET_WHEELS.map((preset) => {
            const isActive = currentPresetId === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectPreset(preset.id);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  isActive
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {preset.badge}
              </button>
            );
          })}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Token Counter */}
          <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800/80 border border-slate-700/80 text-xs font-bold text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{tokens} Tours</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            aria-label={isMuted ? 'Activer le son' : 'Couper le son'}
            className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title={isMuted ? 'Activer le son' : 'Couper le son'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>

          {/* History Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenHistory();
            }}
            aria-label="Historique des tirages"
            className="relative p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Historique des tirages"
          >
            <History className="w-4 h-4" />
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-500 text-[10px] font-bold text-white flex items-center justify-center shadow">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Wheel Customizer */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCustomizer();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Personnaliser</span>
          </button>

          {/* Fullscreen */}
          <button
            onClick={onToggleFullscreen}
            aria-label="Mode plein écran"
            className="hidden sm:flex p-2 text-slate-300 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 transition-colors"
            title="Plein écran"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
