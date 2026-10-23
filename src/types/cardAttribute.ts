/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Atributos Elementais e Mapeamento de Molduras (Card Frames)
 * =========================================================================
 * Mapeamento canônico e permanente dos 6 atributos de Sorcery: Contested Realm
 * vinculados às suas respectivas molduras de alta fidelidade em PNG.
 */

import { CardTypeId } from './cardType';

export type CardAttributeId = 'multi' | 'neutral' | 'land' | 'air' | 'fire' | 'water';

export interface CardAttributeDefinition {
  id: CardAttributeId;
  name: string;
  elementName: string;
  subtitle: string;
  fileName: string;
  framePath: string;
  thumbnailPath: string;
  themeColor: {
    accent: string;
    border: string;
    bgBadge: string;
    textBadge: string;
    ring: string;
  };
  description: string;
}

export const CARD_ATTRIBUTES: CardAttributeDefinition[] = [
  {
    id: 'multi',
    name: 'Multi',
    elementName: 'Misto / Elemental',
    subtitle: 'Artes Arcanas Múltiplas',
    fileName: 'Multi.png',
    framePath: '/assets/frames/Multi.png',
    thumbnailPath: '/assets/frames/Multi.png',
    themeColor: {
      accent: '#A47A45',
      border: 'border-[#A47A45]',
      bgBadge: 'bg-[#A47A45]/15',
      textBadge: 'text-[#7C5B32]',
      ring: 'ring-[#A47A45]',
    },
    description: 'Moldura dourada ricamente entalhada com filigranas florais arcanas e detalhes ancestrais.',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    elementName: 'Neutro / Incolor',
    subtitle: 'Essência Imparcial',
    fileName: 'Neutral.png',
    framePath: '/assets/frames/Neutral.png',
    thumbnailPath: '/assets/frames/Neutral.png',
    themeColor: {
      accent: '#475569',
      border: 'border-slate-500',
      bgBadge: 'bg-slate-200',
      textBadge: 'text-slate-800',
      ring: 'ring-slate-500',
    },
    description: 'Moldura escura em ferro lavrado com padrões geométricos losangulares e relevo lapidado.',
  },
  {
    id: 'land',
    name: 'Land',
    elementName: 'Terra / Raízes',
    subtitle: 'Domínio Terrestre',
    fileName: 'Land.png',
    framePath: '/assets/frames/Land.png',
    thumbnailPath: '/assets/frames/Land.png',
    themeColor: {
      accent: '#7C5B32',
      border: 'border-[#7C5B32]',
      bgBadge: 'bg-[#7C5B32]/15',
      textBadge: 'text-[#5A3E1F]',
      ring: 'ring-[#7C5B32]',
    },
    description: 'Moldura em bronze rústico com textura terrosa ancestral e detalhes em pedra de alvenaria.',
  },
  {
    id: 'air',
    name: 'Air',
    elementName: 'Ar / Ventos',
    subtitle: 'Ventos Primordiais',
    fileName: 'Air.png',
    framePath: '/assets/frames/Air.png',
    thumbnailPath: '/assets/frames/Air.png',
    themeColor: {
      accent: '#6366f1',
      border: 'border-indigo-500',
      bgBadge: 'bg-indigo-100',
      textBadge: 'text-indigo-900',
      ring: 'ring-indigo-500',
    },
    description: 'Moldura etérea em pedra ametista escura com gravações cósmicas e reflexos de cristal.',
  },
  {
    id: 'fire',
    name: 'Fire',
    elementName: 'Fogo / Chamas',
    subtitle: 'Fogo Incandescente',
    fileName: 'Fire.png',
    framePath: '/assets/frames/Fire.png',
    thumbnailPath: '/assets/frames/Fire.png',
    themeColor: {
      accent: '#dc2626',
      border: 'border-red-600',
      bgBadge: 'bg-red-100',
      textBadge: 'text-red-900',
      ring: 'ring-red-600',
    },
    description: 'Moldura em laca carmesim viva com fulgor de chamas ancestrais e partículas incandescentes.',
  },
  {
    id: 'water',
    name: 'Water',
    elementName: 'Água / Mares',
    subtitle: 'Maré das Profundezas',
    fileName: 'Water.png',
    framePath: '/assets/frames/Water.png',
    thumbnailPath: '/assets/frames/Water.png',
    themeColor: {
      accent: '#0284c7',
      border: 'border-sky-600',
      bgBadge: 'bg-sky-100',
      textBadge: 'text-sky-900',
      ring: 'ring-sky-600',
    },
    description: 'Moldura cerúlea profunda esculpida em rocha marinha com reflexos luminosos de água pura.',
  },
];

/**
 * Determina se um tipo de carta requer a etapa de seleção de atributo.
 * Somente Minion, Magic, Aura e Artifact passam por essa etapa.
 * Site e Avatar não passam.
 */
export function requiresAttributeSelection(cardType?: CardTypeId | null): boolean {
  return cardType === 'minion' || cardType === 'magic' || cardType === 'aura' || cardType === 'artifact';
}

/**
 * Obtém a definição do atributo pelo seu ID.
 */
export function getAttributeById(id?: CardAttributeId | string | null): CardAttributeDefinition | undefined {
  if (!id) return undefined;
  return CARD_ATTRIBUTES.find((attr) => attr.id.toLowerCase() === id.toLowerCase());
}

/**
 * Localiza a definição do atributo a partir da URL ou nome de arquivo da moldura.
 */
export function findAttributeByFrameUrl(url?: string | null): CardAttributeDefinition | undefined {
  if (!url) return undefined;
  const clean = url.toLowerCase();
  return CARD_ATTRIBUTES.find((attr) => {
    const fName = attr.fileName.toLowerCase();
    const id = attr.id.toLowerCase();
    return clean.includes(fName) || clean.endsWith(`/${id}.png`) || clean.includes(`/${id}_`);
  });
}

/**
 * Retorna o caminho canônico do arquivo de moldura para o atributo.
 */
export function getFrameUrlForAttribute(attrId: CardAttributeId): string {
  const attr = CARD_ATTRIBUTES.find((a) => a.id === attrId);
  return attr ? attr.framePath : '/assets/frames/Multi.png';
}

/**
 * Restringe os Thresholds elementais conforme o atributo selecionado da carta:
 * - Air: Somente Air
 * - Fire: Somente Fire
 * - Water: Somente Water
 * - Land: Somente Earth (Land corresponde ao elemento Earth no sistema de Thresholds)
 * - Multi: Air, Fire, Water e Earth (permite combinar todos)
 * - Neutral: Nenhum ([])
 * 
 * Se o atributo for indefinido (ex: Site / Avatar sem seleção de atributo), permite todos.
 */
export function getAllowedThresholdElements(
  attribute?: CardAttributeId | string | null
): import('./sorcery').SorceryElement[] {
  const newModels: import('./sorcery').SorceryElement[] = [
    'espirito',
    'materia',
    'vazio',
    'vida',
    'morte',
  ];

  if (!attribute) {
    return ['air', 'earth', 'fire', 'water', ...newModels];
  }

  switch (attribute.toLowerCase()) {
    case 'air':
      return ['air', ...newModels];
    case 'fire':
      return ['fire', ...newModels];
    case 'water':
      return ['water', ...newModels];
    case 'land':
      return ['earth', ...newModels];
    case 'multi':
      return ['air', 'earth', 'fire', 'water', ...newModels];
    case 'neutral':
      return [...newModels];
    default:
      return ['air', 'earth', 'fire', 'water', ...newModels];
  }
}

