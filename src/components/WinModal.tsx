import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { WheelSegment } from '../types';
import { soundEngine } from '../utils/audio';
import { Check, Copy, Share2, Sparkles, RefreshCw, X } from 'lucide-react';

interface WinModalProps {
  segment: WheelSegment | null;
  voucherCode?: string;
  onClose: () => void;
  onSpinAgain: () => void;
  isSecondChance?: boolean;
}

export const WinModal: React.FC<WinModalProps> = ({
  segment,
  voucherCode,
  onClose,
  onSpinAgain,
  isSecondChance = false,
}) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!segment) return;

    if (segment.type === 'jackpot') {
      soundEngine.playJackpot();
      // Grand double confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#fbbf24', '#f59e0b', '#38bdf8', '#a855f7', '#ffffff'],
        });
        setTimeout(() => {
          confetti({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
          });
          confetti({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
          });
        }, 300);
      } catch {
        // Safe
      }
    } else if (segment.type === 'gift' || segment.type === 'bonus') {
      soundEngine.playWin();
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#fbbf24'],
        });
      } catch {
        // Safe
      }
    } else if (segment.type === 'retry') {
      soundEngine.playSecondChance();
    } else if (segment.type === 'lose') {
      soundEngine.playLose();
    }
  }, [segment]);

  if (!segment) return null;

  const isWin = segment.type === 'jackpot' || segment.type === 'gift' || segment.type === 'bonus';
  const isRetry = segment.type === 'retry';

  const handleCopy = () => {
    if (voucherCode) {
      navigator.clipboard.writeText(voucherCode).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: 'YAS SPIN - Roue de la Fortune',
          text: isWin
            ? `J'ai gagné ${segment.label} sur la roue YAS SPIN ! Tente ta chance toi aussi ! 🎉`
            : `Fais tourner la roue YAS SPIN et gagne des forfaits et cadeaux !`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      handleCopy();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-center shadow-2xl shadow-cyan-950/40 overflow-hidden">
        {/* Top decorative light glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-48 rounded-full blur-3xl pointer-events-none opacity-50"
          style={{
            backgroundColor: isWin
              ? '#0284c7'
              : isRetry
              ? '#f59e0b'
              : '#475569',
          }}
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Fermer"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Result Icon */}
        <div className="relative inline-flex items-center justify-center mb-4">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center text-5xl shadow-lg border"
            style={{
              backgroundColor: `${segment.color}25`,
              borderColor: segment.color,
            }}
          >
            {segment.icon || (isWin ? '🎁' : isRetry ? '🔄' : '💔')}
          </div>
          {isWin && (
            <div className="absolute -top-2 -right-2 p-1.5 bg-amber-400 text-slate-950 rounded-full shadow-md animate-bounce">
              <Sparkles className="w-4 h-4" />
            </div>
          )}
        </div>

        {/* Status Header */}
        <div className="mb-2">
          {isWin && (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              {segment.type === 'jackpot' ? '★ JACKPOT EXCEPTIONNEL ★' : 'FELICITATIONS !'}
            </span>
          )}
          {isRetry && (
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              BONUS 2ÈME CHANCE
            </span>
          )}
          {!isWin && !isRetry && (
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              RESULTAT DU TIRAGE
            </span>
          )}
        </div>

        {/* Prize Label */}
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          {segment.label}
        </h2>
        {segment.subtext && (
          <p className="text-sm text-slate-300 font-medium mb-4">
            {segment.subtext}
          </p>
        )}

        {/* Win Card / Voucher */}
        {isWin && voucherCode && (
          <div className="my-5 p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-left">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Code Voucher de Retrait</span>
              <span className="text-emerald-400 font-semibold">Valide 30 jours</span>
            </div>
            <div className="flex items-center justify-between gap-2 p-2.5 bg-slate-950 rounded-xl border border-slate-700/60 font-mono text-sm sm:text-base font-bold text-amber-300">
              <span>{voucherCode}</span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-sans rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
            {segment.claimNote && (
              <p className="text-xs text-slate-400 mt-2 italic">
                ℹ️ {segment.claimNote}
              </p>
            )}
          </div>
        )}

        {/* 2ème chance message */}
        {isRetry && (
          <div className="my-5 p-4 rounded-2xl bg-amber-950/40 border border-amber-600/40 text-amber-200 text-sm">
            🎉 <strong>Règle officielle Yas :</strong> Vous avez décroché un tour supplémentaire gratuit ! Faites tourner la roue sans attendre.
          </div>
        )}

        {/* Lose encouraging message */}
        {!isWin && !isRetry && (
          <div className="my-4 p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm">
            Pas de gain cette fois-ci, mais ne baissez pas les bras ! La chance sourit aux persévérants.
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={() => {
              onClose();
              onSpinAgain();
            }}
            className="flex-1 py-3 px-5 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{isRetry ? 'Lancer ma 2ème chance' : 'Rejouer maintenant'}</span>
          </button>

          {isWin ? (
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center gap-2 transition-colors border border-slate-700"
            >
              <Share2 className="w-4 h-4" />
              <span>Partager</span>
            </button>
          ) : (
            <button
              onClick={onClose}
              className="py-3 px-4 rounded-xl font-medium text-sm bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700"
            >
              Fermer
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
