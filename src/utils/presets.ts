import { PresetWheel, WheelTheme } from '../types';

export const THEMES: Record<string, WheelTheme> = {
  yas: {
    id: 'yas',
    name: 'Yas Neon Cyan & Gold',
    rimColor: '#0c1b33',
    pegColor: '#fbbf24',
    pointerColor: '#ef4444',
    hubBg: '#0f172a',
    glowColor: 'rgba(6, 182, 212, 0.45)',
  },
  gold: {
    id: 'gold',
    name: 'Casino VIP Or & Rubis',
    rimColor: '#1c1917',
    pegColor: '#fef08a',
    pointerColor: '#dc2626',
    hubBg: '#292524',
    glowColor: 'rgba(234, 179, 8, 0.45)',
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk Violet',
    rimColor: '#180828',
    pegColor: '#22d3ee',
    pointerColor: '#ec4899',
    hubBg: '#2e1065',
    glowColor: 'rgba(168, 85, 247, 0.5)',
  },
};

export const PRESET_WHEELS: PresetWheel[] = [
  {
    id: 'yas_official',
    name: 'Yas Roue de la Fortune (Officielle)',
    description: 'La vraie roue de la chance avec 12 cases, forfaits data, crédits de recharge, smartphones et 2ème chance !',
    category: 'yas_official',
    badge: '12 Cases Yas',
    segments: [
      {
        id: 'yas-1',
        label: '10 Go Internet',
        subtext: '4G / 5G Max',
        icon: '🚀',
        color: '#0284c7', // Sky blue
        textColor: '#ffffff',
        type: 'jackpot',
        weight: 12,
        rewardCodePrefix: 'YAS-DATA10G',
        claimNote: 'Activé instantanément sur votre numéro Yas.',
      },
      {
        id: 'yas-2',
        label: '5 000 Ar Crédit',
        subtext: 'Appels & SMS',
        icon: '💰',
        color: '#059669', // Emerald
        textColor: '#ffffff',
        type: 'gift',
        weight: 20,
        rewardCodePrefix: 'YAS-CR5K',
        claimNote: 'Solde rechargé directement via code de validation.',
      },
      {
        id: 'yas-3',
        label: 'Perdu !',
        subtext: 'Retentez demain',
        icon: '💔',
        color: '#334155', // Slate
        textColor: '#94a3b8',
        type: 'lose',
        weight: 22,
      },
      {
        id: 'yas-4',
        label: 'Smartphone 5G',
        subtext: 'Lot Exceptionnel',
        icon: '📱',
        color: '#7c3aed', // Violet
        textColor: '#ffffff',
        type: 'jackpot',
        weight: 5,
        rewardCodePrefix: 'YAS-PHONE5G',
        claimNote: 'À retirer dans votre agence Yas munis de votre voucher.',
      },
      {
        id: 'yas-5',
        label: '2ème Chance !',
        subtext: 'Tour gratuit offert',
        icon: '🔄',
        color: '#f59e0b', // Amber
        textColor: '#0f172a',
        type: 'retry',
        weight: 24,
        claimNote: 'Vous gagnez immédiatement un nouveau tour gratuit !',
      },
      {
        id: 'yas-6',
        label: 'Recharge 2 000 Ar',
        subtext: 'Crédit immédiat',
        icon: '⚡',
        color: '#10b981', // Green
        textColor: '#ffffff',
        type: 'gift',
        weight: 26,
        rewardCodePrefix: 'YAS-CR2K',
      },
      {
        id: 'yas-7',
        label: 'Casque Audio Pro',
        subtext: 'Bluetooth HD',
        icon: '🎧',
        color: '#e11d48', // Rose/Red
        textColor: '#ffffff',
        type: 'gift',
        weight: 8,
        rewardCodePrefix: 'YAS-AUDIO',
        claimNote: 'Casque sans fil haute fidélité disponible en agence.',
      },
      {
        id: 'yas-8',
        label: '2 Go Data Bonus',
        subtext: 'Valable 7 jours',
        icon: '🌐',
        color: '#0891b2', // Cyan
        textColor: '#ffffff',
        type: 'gift',
        weight: 28,
        rewardCodePrefix: 'YAS-DATA2G',
      },
      {
        id: 'yas-9',
        label: 'Perdu !',
        subtext: 'Gardez le sourire',
        icon: '😅',
        color: '#1e293b', // Dark slate
        textColor: '#94a3b8',
        type: 'lose',
        weight: 24,
      },
      {
        id: 'yas-10',
        label: 'Montre Connectée',
        subtext: 'Smartwatch Pulse',
        icon: '⌚',
        color: '#d97706', // Gold amber
        textColor: '#ffffff',
        type: 'jackpot',
        weight: 6,
        rewardCodePrefix: 'YAS-WATCH',
        claimNote: 'Smartwatch compatible Android & iOS.',
      },
      {
        id: 'yas-11',
        label: 'Goodies Yas VIP',
        subtext: 'T-shirt + Casquette',
        icon: '🎁',
        color: '#4f46e5', // Indigo
        textColor: '#ffffff',
        type: 'gift',
        weight: 18,
        rewardCodePrefix: 'YAS-GOODIES',
      },
      {
        id: 'yas-12',
        label: '500 Mo Nuit',
        subtext: 'Surfez sans limite',
        icon: '🌙',
        color: '#2563eb', // Blue
        textColor: '#ffffff',
        type: 'bonus',
        weight: 30,
        rewardCodePrefix: 'YAS-NIGHT500',
      },
    ],
  },
  {
    id: 'giveaway_vip',
    name: 'Tirage au Sort & Cadeaux VIP',
    description: 'Une sélection de gros lots high-tech, bons d’achats et surprises pour vos concours.',
    category: 'giveaway',
    badge: 'Concours & Lots',
    segments: [
      { id: 'gw-1', label: 'iPhone 16 Pro', subtext: 'Grand Prix', icon: '📱', color: '#8b5cf6', textColor: '#ffffff', type: 'jackpot', weight: 4, rewardCodePrefix: 'VIP-IPHONE' },
      { id: 'gw-2', label: 'Carte 100 €', subtext: 'Boutique au choix', icon: '💳', color: '#10b981', textColor: '#ffffff', type: 'gift', weight: 12, rewardCodePrefix: 'VIP-CARD100' },
      { id: 'gw-3', label: 'Perdu', subtext: 'Dommage !', icon: '❌', color: '#334155', textColor: '#94a3b8', type: 'lose', weight: 25 },
      { id: 'gw-4', label: 'PlayStation 5', subtext: 'Console Édition', icon: '🎮', color: '#2563eb', textColor: '#ffffff', type: 'jackpot', weight: 4, rewardCodePrefix: 'VIP-PS5' },
      { id: 'gw-5', label: 'AirPods Pro', subtext: 'Écouteurs TWS', icon: '🎧', color: '#06b6d4', textColor: '#ffffff', type: 'gift', weight: 14, rewardCodePrefix: 'VIP-AIRPODS' },
      { id: 'gw-6', label: 'Bon -25%', subtext: 'Valable tout le site', icon: '🏷️', color: '#f59e0b', textColor: '#0f172a', type: 'gift', weight: 28, rewardCodePrefix: 'VIP-DISC25' },
      { id: 'gw-7', label: 'Rejouez !', subtext: 'Nouvel essai gratuit', icon: '⭐', color: '#ec4899', textColor: '#ffffff', type: 'retry', weight: 18 },
      { id: 'gw-8', label: 'Enceinte JBL', subtext: 'Son portable étanche', icon: '🔊', color: '#ea580c', textColor: '#ffffff', type: 'gift', weight: 15, rewardCodePrefix: 'VIP-JBL' },
    ],
  },
  {
    id: 'decision_quick',
    name: 'Roue Décision Oui / Non',
    description: 'Besoin de trancher un dilemme ou d’une réponse immédiate ? Laissez tourner la roue !',
    category: 'decision',
    badge: 'Décision',
    segments: [
      { id: 'dec-1', label: 'OUI, absolument !', subtext: 'Le destin dit oui', icon: '✅', color: '#16a34a', textColor: '#ffffff', type: 'gift', weight: 25 },
      { id: 'dec-2', label: 'NON, oublie !', subtext: 'Mauvaise idée', icon: '🚫', color: '#dc2626', textColor: '#ffffff', type: 'lose', weight: 25 },
      { id: 'dec-3', label: 'Peut-être plus tard', subtext: 'Attends un peu', icon: '⏳', color: '#d97706', textColor: '#ffffff', type: 'neutral', weight: 20 },
      { id: 'dec-4', label: 'Fonce sans hésiter', subtext: '100% feu vert', icon: '🔥', color: '#0284c7', textColor: '#ffffff', type: 'gift', weight: 25 },
      { id: 'dec-5', label: 'Demande à un proche', subtext: 'Avis extérieur', icon: '👥', color: '#9333ea', textColor: '#ffffff', type: 'neutral', weight: 15 },
      { id: 'dec-6', label: 'Retente ta chance', subtext: 'Roue indécise', icon: '🎲', color: '#0d9488', textColor: '#ffffff', type: 'retry', weight: 20 },
    ],
  },
  {
    id: 'party_challenges',
    name: 'Défis & Soirée entre Amis',
    description: 'Animez vos soirées avec des gages, actions drôles et questions croustillantes !',
    category: 'party',
    badge: 'Fun & Jeux',
    segments: [
      { id: 'pty-1', label: 'Fais 15 pompes', subtext: 'Montre tes muscles', icon: '💪', color: '#e11d48', textColor: '#ffffff', type: 'neutral', weight: 20 },
      { id: 'pty-2', label: 'Imite une star', subtext: '30 secondes au top', icon: '🎭', color: '#8b5cf6', textColor: '#ffffff', type: 'neutral', weight: 20 },
      { id: 'pty-3', label: 'Passe ton tour', subtext: 'Sauvé par le gong', icon: '🛡️', color: '#10b981', textColor: '#ffffff', type: 'gift', weight: 15 },
      { id: 'pty-4', label: 'Raconte une honte', subtext: 'Vérité totale', icon: '😳', color: '#f59e0b', textColor: '#0f172a', type: 'neutral', weight: 20 },
      { id: 'pty-5', label: 'Chante un refrain', subtext: 'À pleine voix !', icon: '🎤', color: '#06b6d4', textColor: '#ffffff', type: 'neutral', weight: 20 },
      { id: 'pty-6', label: 'Double gage !', subtext: 'Pour le joueur suivant', icon: '⚡', color: '#4f46e5', textColor: '#ffffff', type: 'bonus', weight: 15 },
      { id: 'pty-7', label: 'Danse du robot', subtext: 'Rythme endiablé', icon: '🤖', color: '#db2777', textColor: '#ffffff', type: 'neutral', weight: 20 },
      { id: 'pty-8', label: 'Shot ou verre d’eau', subtext: 'Santé !', icon: '🥤', color: '#059669', textColor: '#ffffff', type: 'neutral', weight: 15 },
    ],
  },
];

export function generateVoucherCode(prefix: string = 'YAS'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let rand = '';
  for (let i = 0; i < 6; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}-${rand.slice(0, 3)}-${rand.slice(3)}`;
}
