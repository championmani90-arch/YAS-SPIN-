import { useState, useEffect, useCallback } from 'react';
import { WheelSegment, SpinResult } from './types';
import { PRESET_WHEELS, generateVoucherCode } from './utils/presets';
import { soundEngine } from './utils/audio';
import { SpinWheel } from './components/SpinWheel';
import { WinModal } from './components/WinModal';
import { WheelCustomizer } from './components/WheelCustomizer';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { Info, Sparkles, CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_SEGMENTS = 'yas_spin_segments_v1';
const STORAGE_KEY_HISTORY = 'yas_spin_history_v1';
const STORAGE_KEY_TOKENS = 'yas_spin_tokens_v1';

export default function App() {
  // Preset selection
  const [selectedPresetId, setSelectedPresetId] = useState<string>('yas_official');
  
  // Wheel segments
  const [segments, setSegments] = useState<WheelSegment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SEGMENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // safe
    }
    return PRESET_WHEELS[0].segments;
  });

  // History
  const [history, setHistory] = useState<SpinResult[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {
      // safe
    }
    return [];
  });

  // Tokens / Spins available
  const [tokens, setTokens] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TOKENS);
      if (saved !== null) return parseInt(saved, 10);
    } catch {
      // safe
    }
    return 5;
  });

  // UI States
  const [isSpinning, setIsSpinning] = useState<boolean>(false);
  const [winResult, setWinResult] = useState<{
    segment: WheelSegment;
    voucherCode?: string;
    isSecondChance?: boolean;
  } | null>(null);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [spinPower, setSpinPower] = useState<'light' | 'normal' | 'strong' | 'turbo'>('normal');
  const [theme, setTheme] = useState<'yas' | 'gold' | 'cyber'>('yas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SEGMENTS, JSON.stringify(segments));
    } catch {
      // safe
    }
  }, [segments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
    } catch {
      // safe
    }
  }, [history]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TOKENS, tokens.toString());
    } catch {
      // safe
    }
  }, [tokens]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleSelectPreset = (presetId: string) => {
    const found = PRESET_WHEELS.find((p) => p.id === presetId);
    if (found) {
      setSelectedPresetId(presetId);
      setSegments(found.segments);
      showToast(`Roue "${found.name}" chargée !`);
    }
  };

  const handleSpinStart = () => {
    setIsSpinning(true);
    setTokens((prev) => Math.max(0, prev - 1));
  };

  const handleSpinComplete = useCallback((winningSegment: WheelSegment) => {
    setIsSpinning(false);

    let voucher: string | undefined;
    const isWin = winningSegment.type === 'jackpot' || winningSegment.type === 'gift' || winningSegment.type === 'bonus';
    if (isWin) {
      voucher = generateVoucherCode(winningSegment.rewardCodePrefix || 'YAS');
    }

    // If 2ème chance / retry, give a bonus token!
    const isRetry = winningSegment.type === 'retry';
    if (isRetry) {
      setTokens((prev) => prev + 1);
      showToast('🎉 2ème Chance débloquée ! +1 Tour offert !');
    }

    const newResult: SpinResult = {
      id: `spin-${Date.now()}`,
      timestamp: Date.now(),
      segment: winningSegment,
      voucherCode: voucher,
      isSecondChance: isRetry,
    };

    setHistory((prev) => [newResult, ...prev]);
    setWinResult({
      segment: winningSegment,
      voucherCode: voucher,
      isSecondChance: isRetry,
    });
  }, []);

  const handleToggleSound = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    soundEngine.setMuted(nextState);
    showToast(nextState ? 'Son désactivé' : 'Son activé');
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleAddTokens = () => {
    soundEngine.playClick();
    setTokens((prev) => prev + 5);
    showToast('+5 Tours ajoutés !');
  };

  const totalWins = history.filter(
    (h) => h.segment.type === 'jackpot' || h.segment.type === 'gift' || h.segment.type === 'bonus'
  ).length;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Dynamic Background Lighting Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[35%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Navbar */}
      <Navbar
        currentPresetId={selectedPresetId}
        onSelectPreset={handleSelectPreset}
        onOpenCustomizer={() => setIsCustomizerOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={history.length}
        isMuted={isMuted}
        onToggleSound={handleToggleSound}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        tokens={tokens}
      />

      {/* Main Wheel Viewport */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-4 sm:py-6 relative z-10">
        {/* Title & Tagline */}
        <div className="text-center max-w-xl mx-auto mb-2 sm:mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-amber-400 font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Grand Jeu Concours Yas Spin</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase">
            Tournez & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-400 to-cyan-400">Gagnez !</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-md mx-auto">
            Tentez votre chance chaque jour pour remporter des forfaits data, recharges, smartphones et cadeaux exclusifs.
          </p>
        </div>

        {/* The Interactive Wheel Component */}
        <div className="w-full flex justify-center items-center my-2">
          <SpinWheel
            segments={segments}
            isSpinning={isSpinning}
            onSpinStart={handleSpinStart}
            onSpinComplete={handleSpinComplete}
            theme={theme}
            spinPower={spinPower}
          />
        </div>

        {/* Quick Rules & Promo Highlights */}
        <div className="mt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
          <button
            onClick={() => setIsRulesOpen(true)}
            className="flex items-center gap-1.5 hover:text-cyan-400 transition-colors underline decoration-slate-600 underline-offset-4"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Consulter les règles & lots</span>
          </button>
          <span>·</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>2ème chance offerte</span>
          </span>
        </div>

        {/* Stats & Controls Bar */}
        <StatsBar
          totalSpins={history.length}
          totalWins={totalWins}
          tokens={tokens}
          onAddTokens={handleAddTokens}
          spinPower={spinPower}
          onChangeSpinPower={setSpinPower}
          activeTheme={theme}
          onChangeTheme={setTheme}
        />
      </main>

      {/* Rules Modal */}
      {isRulesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl text-left">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <Info className="w-5 h-5 text-cyan-400" />
              <span>Règlement du Jeu YAS SPIN</span>
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Jeu promotionnel gratuit avec obligation de bonne humeur !
            </p>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white block mb-0.5">1. Tours Quotidiens</strong>
                Chaque participant bénéficie de tours de roue réguliers pour tenter de décrocher des forfaits Internet (jusqu'à 10 Go), des crédits d'appels et des appareils high-tech.
              </div>

              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/30 text-amber-200">
                <strong className="text-amber-300 block mb-0.5">2. Règle Officielle de la 2ème Chance</strong>
                Si la flèche s'arrête sur une case "Perdu" ou "2ème Chance", un nouveau tour gratuit vous est automatiquement accordé pour retenter immédiatement votre chance !
              </div>

              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <strong className="text-white block mb-0.5">3. Retrait des Lots & Vouchers</strong>
                Tout gain génère un coupon sécurisé à conserver dans l'onglet Historique. Les forfaits data et recharges s'activent directement via le code attribué.
              </div>
            </div>

            <button
              onClick={() => setIsRulesOpen(false)}
              className="mt-6 w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors border border-slate-700"
            >
              Compris, je joue !
            </button>
          </div>
        </div>
      )}

      {/* Win Modal Popup */}
      {winResult && (
        <WinModal
          segment={winResult.segment}
          voucherCode={winResult.voucherCode}
          onClose={() => setWinResult(null)}
          onSpinAgain={() => {
            setWinResult(null);
          }}
          isSecondChance={winResult.isSecondChance}
        />
      )}

      {/* Wheel Customizer Drawer / Modal */}
      {isCustomizerOpen && (
        <WheelCustomizer
          segments={segments}
          onSave={(newSegs) => {
            setSegments(newSegs);
            showToast('Roue mise à jour avec succès !');
          }}
          onResetToDefault={() => {
            const def = PRESET_WHEELS[0].segments;
            setSegments(def);
            showToast('Roue réinitialisée au modèle Yas officiel');
          }}
          onClose={() => setIsCustomizerOpen(false)}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        history={history}
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onClearHistory={() => {
          setHistory([]);
          showToast('Historique effacé');
        }}
      />

      {/* Toast Feedback Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-slate-900 border border-cyan-500/50 text-white text-xs font-semibold shadow-xl shadow-cyan-950/50 flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 py-4 px-6 text-center text-[11px] text-slate-500 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 YAS SPIN · Roue de la fortune & tirage promotionnel</span>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsCustomizerOpen(true)} className="hover:text-slate-400">Éditeur de cases</button>
            <button onClick={() => setIsRulesOpen(true)} className="hover:text-slate-400">Règlement</button>
            <button onClick={() => setIsHistoryOpen(true)} className="hover:text-slate-400">Mes gains</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
