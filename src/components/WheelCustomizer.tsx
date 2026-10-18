import React, { useState } from 'react';
import { WheelSegment, SegmentType } from '../types';
import { Plus, Trash2, RotateCcw, X, Check, Palette } from 'lucide-react';

interface WheelCustomizerProps {
  segments: WheelSegment[];
  onSave: (updatedSegments: WheelSegment[]) => void;
  onResetToDefault: () => void;
  onClose: () => void;
}

const COLOR_PALETTE = [
  '#0284c7', // Sky Blue
  '#059669', // Emerald
  '#7c3aed', // Violet
  '#e11d48', // Rose Red
  '#f59e0b', // Amber Gold
  '#0891b2', // Cyan
  '#2563eb', // Blue
  '#ea580c', // Orange
  '#d97706', // Yellow Gold
  '#10b981', // Mint Green
  '#8b5cf6', // Purple
  '#334155', // Slate Grey
];

const EMOJI_QUICK_PICKS = ['🎁', '💰', '📱', '🎧', '🚀', '⚡', '🔄', '💔', '⭐', '⌚', '🎮', '🌙', '🔥', '🎟️', '🍕'];

export const WheelCustomizer: React.FC<WheelCustomizerProps> = ({
  segments,
  onSave,
  onResetToDefault,
  onClose,
}) => {
  const [localSegments, setLocalSegments] = useState<WheelSegment[]>([...segments]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleUpdateSegment = (id: string, updates: Partial<WheelSegment>) => {
    setLocalSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const handleAddSegment = () => {
    const newId = `custom-${Date.now()}`;
    const nextColor = COLOR_PALETTE[localSegments.length % COLOR_PALETTE.length];
    const newSegment: WheelSegment = {
      id: newId,
      label: `Nouveau Lot ${localSegments.length + 1}`,
      subtext: 'Description',
      icon: '🎁',
      color: nextColor,
      textColor: '#ffffff',
      type: 'gift',
      weight: 15,
      rewardCodePrefix: 'YAS-WIN',
    };
    setLocalSegments((prev) => [...prev, newSegment]);
    setEditingId(newId);
  };

  const handleDeleteSegment = (id: string) => {
    if (localSegments.length <= 2) {
      alert('La roue doit contenir au minimum 2 cases.');
      return;
    }
    setLocalSegments((prev) => prev.filter((s) => s.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const handleSave = () => {
    if (localSegments.length < 2) return;
    onSave(localSegments);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-400" />
              <span>Personnaliser les Cases de la Roue</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Modifiez les textes, icônes, couleurs et probabilités de chaque segment ({localSegments.length} cases actives).
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Fermer"
            className="p-2 text-slate-400 hover:text-white rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segments List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {localSegments.map((seg, index) => {
            const isEditing = editingId === seg.id;
            return (
              <div
                key={seg.id}
                className={`p-3.5 rounded-2xl border transition-all ${
                  isEditing
                    ? 'bg-slate-800/90 border-cyan-500 ring-1 ring-cyan-500/30'
                    : 'bg-slate-800/40 border-slate-700/60 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Case Number & Color Indicator */}
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm shrink-0"
                    style={{ backgroundColor: seg.color }}
                  >
                    {index + 1}
                  </div>

                  {/* Icon */}
                  <span className="text-xl shrink-0">{seg.icon}</span>

                  {/* Summary */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {seg.label}
                    </p>
                    {seg.subtext && (
                      <p className="text-xs text-slate-400 truncate">{seg.subtext}</p>
                    )}
                  </div>

                  {/* Type badge text (clean zero-pill style) */}
                  <span className="text-xs text-slate-400 hidden sm:inline">
                    {seg.type === 'jackpot' ? '★ Jackpot' : seg.type === 'retry' ? '🔄 2ème Chance' : seg.type === 'lose' ? 'Perdu' : 'Lot'}
                  </span>

                  {/* Weight */}
                  <div className="text-xs text-slate-400 shrink-0">
                    Poids: <span className="text-amber-400 font-bold">{seg.weight}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setEditingId(isEditing ? null : seg.id)}
                      className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                    >
                      {isEditing ? 'Fermer' : 'Éditer'}
                    </button>
                    <button
                      onClick={() => handleDeleteSegment(seg.id)}
                      disabled={localSegments.length <= 2}
                      aria-label="Supprimer la case"
                      className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-slate-700/60 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Nom du lot / Texte principal
                        </label>
                        <input
                          type="text"
                          value={seg.label}
                          onChange={(e) => handleUpdateSegment(seg.id, { label: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Sous-titre / Détail
                        </label>
                        <input
                          type="text"
                          value={seg.subtext || ''}
                          onChange={(e) => handleUpdateSegment(seg.id, { subtext: e.target.value })}
                          className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Catégorie
                        </label>
                        <select
                          value={seg.type}
                          onChange={(e) => handleUpdateSegment(seg.id, { type: e.target.value as SegmentType })}
                          className="w-full px-2.5 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        >
                          <option value="gift">🎁 Cadeau standard</option>
                          <option value="jackpot">★ Jackpot Suprême</option>
                          <option value="retry">🔄 2ème Chance (Rejouer)</option>
                          <option value="lose">💔 Perdu / Sans lot</option>
                          <option value="bonus">⚡ Bonus spécial</option>
                          <option value="neutral">⚖️ Neutre (Oui/Non/Défi)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Probabilité relative (Poids)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={seg.weight}
                          onChange={(e) => handleUpdateSegment(seg.id, { weight: Math.max(1, parseInt(e.target.value) || 1) })}
                          className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Préfixe Voucher
                        </label>
                        <input
                          type="text"
                          value={seg.rewardCodePrefix || 'YAS'}
                          onChange={(e) => handleUpdateSegment(seg.id, { rewardCodePrefix: e.target.value.toUpperCase() })}
                          className="w-full px-3 py-1.5 text-sm bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                        />
                      </div>
                    </div>

                    {/* Emoji Picker */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Icône (Emoji)
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {EMOJI_QUICK_PICKS.map((em) => (
                          <button
                            key={em}
                            type="button"
                            onClick={() => handleUpdateSegment(seg.id, { icon: em })}
                            className={`w-8 h-8 rounded-lg text-lg flex items-center justify-center transition-colors ${
                              seg.icon === em ? 'bg-cyan-600 text-white' : 'bg-slate-900 hover:bg-slate-700'
                            }`}
                          >
                            {em}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div>
                      <label className="block text-xs font-medium text-slate-300 mb-1">
                        Couleur de la case
                      </label>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {COLOR_PALETTE.map((col) => (
                          <button
                            key={col}
                            type="button"
                            onClick={() => handleUpdateSegment(seg.id, { color: col })}
                            className={`w-6 h-6 rounded-full border-2 transition-transform ${
                              seg.color === col ? 'border-white scale-110' : 'border-transparent'
                            }`}
                            style={{ backgroundColor: col }}
                          />
                        ))}
                        <input
                          type="color"
                          value={seg.color}
                          onChange={(e) => handleUpdateSegment(seg.id, { color: e.target.value })}
                          className="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0"
                          title="Couleur personnalisée"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddSegment}
              className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter une case</span>
            </button>
            <button
              onClick={onResetToDefault}
              className="py-2 px-3 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Réinitialiser</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-2 px-4 rounded-xl text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              className="py-2 px-5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Appliquer à la roue</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
