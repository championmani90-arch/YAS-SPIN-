import React from 'react';
import { SpinResult } from '../types';
import { X, Copy, Trash2, Download, Trophy, History as HistoryIcon } from 'lucide-react';

interface HistoryDrawerProps {
  history: SpinResult[];
  isOpen: boolean;
  onClose: () => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  isOpen,
  onClose,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  const handleCopy = (code?: string) => {
    if (code) {
      navigator.clipboard.writeText(code).catch(() => {});
    }
  };

  const handleExportCSV = () => {
    if (history.length === 0) return;
    const rows = [
      ['Date & Heure', 'Lot', 'Catégorie', 'Code Voucher'],
      ...history.map((h) => [
        new Date(h.timestamp).toLocaleString('fr-FR'),
        `"${h.segment.label.replace(/"/g, '""')}"`,
        h.segment.type,
        h.voucherCode || '-',
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `yas_spin_historique_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md h-full bg-slate-900 border-l border-slate-800 flex flex-col shadow-2xl animate-slide-left">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HistoryIcon className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Historique des Tirages</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="px-5 py-2.5 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>{history.length} tirages enregistrés</span>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1 hover:text-cyan-400 transition-colors"
                  title="Exporter en CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exporter</span>
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={onClearHistory}
                  className="flex items-center gap-1 hover:text-rose-400 transition-colors"
                  title="Effacer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Vider</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Trophy className="w-12 h-12 mb-3 stroke-1 opacity-40 text-slate-400" />
              <p className="text-sm font-medium text-slate-400">Aucun tirage effectué</p>
              <p className="text-xs text-slate-500 mt-1">
                Faites tourner la roue YAS SPIN pour enregistrer vos gains et vouchers !
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isWin = item.segment.type === 'jackpot' || item.segment.type === 'gift' || item.segment.type === 'bonus';
              const dateStr = new Date(item.timestamp).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3 hover:border-slate-600 transition-colors"
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm"
                    style={{ backgroundColor: `${item.segment.color}25` }}
                  >
                    {item.segment.icon || '🎁'}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-white truncate">
                        {item.segment.label}
                      </p>
                      <span className="text-[10px] text-slate-400 font-mono ml-2 shrink-0">
                        {dateStr}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                      <span>{item.segment.subtext || (isWin ? 'Lot gagné' : 'Sans lot')}</span>
                      {item.voucherCode && (
                        <button
                          onClick={() => handleCopy(item.voucherCode)}
                          className="flex items-center gap-1 font-mono text-amber-300 hover:text-amber-200 transition-colors"
                          title="Copier le code"
                        >
                          <span className="text-[11px]">{item.voucherCode}</span>
                          <Copy className="w-3 h-3 opacity-70" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
