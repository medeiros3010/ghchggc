/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Tipos e Definições de Tipos de Carta de Sorcery: Contested Realm
 * =========================================================================
 * Estrutura modular para seleção e carregamento de editores especializados.
 */

export type CardTypeId = 'site' | 'avatar' | 'magic' | 'aura' | 'artifact' | 'minion';

export type CardTypeStatus = 'available' | 'coming_soon';

export interface CardTypeDefinition {
  id: CardTypeId;
  name: string;
  subtitle: string;
  description: string;
  status: CardTypeStatus;
  badgeLabel: string;
  themeColor: {
    accent: string;
    border: string;
    bgHover: string;
    badgeBg: string;
    badgeText: string;
  };
  features: string[];
}

export const CARD_TYPES: CardTypeDefinition[] = [
  {
    id: 'site',
    name: 'Site',
    subtitle: 'Local / Reino',
    description: 'Terrenos e pontos estratégicos que formam o Atlas do reino de Sorcery (Formato Horizontal 88 × 63 mm).',
    status: 'available',
    badgeLabel: 'Disponível',
    themeColor: {
      accent: 'text-[#3D5346]',
      border: 'border-[#A47A45] ring-2 ring-[#A47A45]/30 shadow-md',
      bgHover: 'group-hover:bg-[#F5ECE0]',
      badgeBg: 'bg-[#3D5346]/10 text-[#3D5346] border border-[#3D5346]/30 font-bold',
      badgeText: 'text-[#3D5346]',
    },
    features: ['Formato Horizontal (88 × 63 mm)', 'Deck do Atlas', 'Custo de Mana & Threshold', 'Ataque & Defesa (ATK / DEF)', 'Modelos e Exportação'],
  },
  {
    id: 'avatar',
    name: 'Avatar',
    subtitle: 'Conjurador Primordial',
    description: 'A personificação mágica do jogador no reino, com vida e habilidades próprias.',
    status: 'available',
    badgeLabel: 'Disponível',
    themeColor: {
      accent: 'text-[#6E302D]',
      border: 'border-[#A47A45] ring-2 ring-[#A47A45]/30 shadow-md',
      bgHover: 'group-hover:bg-[#F5ECE0]',
      badgeBg: 'bg-[#3D5346]/10 text-[#3D5346] border border-[#3D5346]/30 font-bold',
      badgeText: 'text-[#3D5346]',
    },
    features: ['Ponto de Vida Inicial', 'Habilidade Única', 'Presença no Tabuleiro', 'Modelos e Exportação'],
  },
  {
    id: 'magic',
    name: 'Magic',
    subtitle: 'Magia / Feitiço',
    description: 'Conjurações mágicas pontuais com efeitos imediatos de impacto tático.',
    status: 'available',
    badgeLabel: 'Disponível',
    themeColor: {
      accent: 'text-[#415B70]',
      border: 'border-[#A47A45] ring-2 ring-[#A47A45]/30 shadow-md',
      bgHover: 'group-hover:bg-[#F5ECE0]',
      badgeBg: 'bg-[#3D5346]/10 text-[#3D5346] border border-[#3D5346]/30 font-bold',
      badgeText: 'text-[#3D5346]',
    },
    features: ['Custo de Mana & Threshold', 'Sem Ataque/Defesa', 'Cardframe Completo', 'Modelos e Exportação'],
  },
  {
    id: 'aura',
    name: 'Aura',
    subtitle: 'Encantamento Contínuo',
    description: 'Efeitos persistentes vinculados a locais, unidades ou ao próprio reino.',
    status: 'available',
    badgeLabel: 'Disponível',
    themeColor: {
      accent: 'text-[#A47A45]',
      border: 'border-[#A47A45] ring-2 ring-[#A47A45]/30 shadow-md',
      bgHover: 'group-hover:bg-[#F5ECE0]',
      badgeBg: 'bg-[#3D5346]/10 text-[#3D5346] border border-[#3D5346]/30 font-bold',
      badgeText: 'text-[#3D5346]',
    },
    features: ['Custo de Mana & Threshold', 'Sem Ataque/Defesa', 'Cardframe Completo', 'Modelos e Exportação'],
  },
  {
    id: 'artifact',
    name: 'Artifact',
    subtitle: 'Relíquia / Construto',
    description: 'Armas, armaduras, tomos e relíquias ancestrais que permanecem em jogo.',
    status: 'available',
    badgeLabel: 'Disponível',
    themeColor: {
      accent: 'text-[#825F33]',
      border: 'border-[#A47A45] ring-2 ring-[#A47A45]/30 shadow-md',
      bgHover: 'group-hover:bg-[#F5ECE0]',
      badgeBg: 'bg-[#3D5346]/10 text-[#3D5346] border border-[#3D5346]/30 font-bold',
      badgeText: 'text-[#3D5346]',
    },
    features: ['Custo de Mana & Threshold', 'Sem Ataque/Defesa', 'Cardframe Completo', 'Modelos e Exportação'],
  },
  {
    id: 'minion',
    name: 'Minion',
    subtitle: 'Criatura / Servo',
    description: 'Guerreiros, monstros e aliados invocados para combater e controlar o tabuleiro.',
    status: 'available',
    badgeLabel: 'Disponível',
    themeColor: {
      accent: 'text-[#6E302D]',
      border: 'border-[#A47A45] ring-2 ring-[#A47A45]/30 shadow-md',
      bgHover: 'group-hover:bg-[#F5ECE0]',
      badgeBg: 'bg-[#3D5346]/10 text-[#3D5346] border border-[#3D5346]/30 font-bold',
      badgeText: 'text-[#3D5346]',
    },
    features: ['Custo de Mana & Threshold', 'Ataque & Defesa (ATK / DEF)', 'Cardframe Completo', 'Modelos e Exportação'],
  },
];

/**
 * Helper centralizado: indica se o tipo de carta possui atributos de combate (ATK / DEF).
 * 'minion' e 'site' compartilham atributos e controles de combate (ATK e DEF).
 * 'avatar' possui exclusivamente o atributo ATK (com novo ícone de espadas cruzadas).
 * 'magic', 'aura' e 'artifact' não possuem atributos de combate.
 */
export function hasCombatAttributes(cardType?: CardTypeId | null): boolean {
  return cardType === 'minion' || cardType === 'site' || cardType === 'avatar';
}

/**
 * Indica se o tipo de carta suporta o modo duplo (Ataque + Defesa).
 * Minion e Site suportam. Avatar possui exclusivamente Ataque.
 */
export function canHaveDualCombat(cardType?: CardTypeId | null): boolean {
  return cardType === 'minion' || cardType === 'site';
}

/**
 * Retorna o nome formatado do tipo de carta para títulos e rótulos.
 */
export function getCardTypeName(cardType?: CardTypeId | null): string {
  switch (cardType) {
    case 'magic':
      return 'Magic';
    case 'aura':
      return 'Aura';
    case 'artifact':
      return 'Artifact';
    case 'site':
      return 'Site';
    case 'avatar':
      return 'Avatar';
    case 'minion':
    default:
      return 'Minion';
  }
}
