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
 * 5 Molduras Exclusivas para Cartas do Tipo Site (Proporção Horizontal 88 × 63 mm)
 * --------------------------------------------------------------------------------
 * Air: air(1).png
 * Water: water(1).png
 * Neutral: Neutral(1).png
 * Fire: Fire(1).png
 * Land: land(1).png
 */
export const SITE_CARD_ATTRIBUTES: CardAttributeDefinition[] = [
  {
    id: 'air',
    name: 'Air',
    elementName: 'Ar / Ventos',
    subtitle: 'Ventos de Site',
    fileName: 'air(1).png',
    framePath: '/assets/frames/site/air(1).png',
    thumbnailPath: '/assets/frames/site/air(1).png',
    themeColor: {
      accent: '#6366f1',
      border: 'border-indigo-500',
      bgBadge: 'bg-indigo-100',
      textBadge: 'text-indigo-900',
      ring: 'ring-indigo-500',
    },
    description: 'Moldura horizontal exclusiva de Site com acabamento elemental do Ar.',
  },
  {
    id: 'water',
    name: 'Water',
    elementName: 'Água / Mares',
    subtitle: 'Maré de Site',
    fileName: 'water(1).png',
    framePath: '/assets/frames/site/water(1).png',
    thumbnailPath: '/assets/frames/site/water(1).png',
    themeColor: {
      accent: '#0284c7',
      border: 'border-sky-600',
      bgBadge: 'bg-sky-100',
      textBadge: 'text-sky-900',
      ring: 'ring-sky-600',
    },
    description: 'Moldura horizontal exclusiva de Site com acabamento elemental da Água.',
  },
  {
    id: 'neutral',
    name: 'Neutral',
    elementName: 'Neutro (Todos os Thresholds)',
    subtitle: 'Essência Neutra',
    fileName: 'Neutral(1).png',
    framePath: '/assets/frames/site/Neutral(1).png',
    thumbnailPath: '/assets/frames/site/Neutral(1).png',
    themeColor: {
      accent: '#475569',
      border: 'border-slate-500',
      bgBadge: 'bg-slate-200',
      textBadge: 'text-slate-800',
      ring: 'ring-slate-500',
    },
    description: 'Moldura horizontal exclusiva de Site neutra, permitindo todos os Thresholds.',
  },
  {
    id: 'fire',
    name: 'Fire',
    elementName: 'Fogo / Chamas',
    subtitle: 'Chamas de Site',
    fileName: 'Fire(1).png',
    framePath: '/assets/frames/site/Fire(1).png',
    thumbnailPath: '/assets/frames/site/Fire(1).png',
    themeColor: {
      accent: '#dc2626',
      border: 'border-red-600',
      bgBadge: 'bg-red-100',
      textBadge: 'text-red-900',
      ring: 'ring-red-600',
    },
    description: 'Moldura horizontal exclusiva de Site com acabamento elemental do Fogo.',
  },
  {
    id: 'land',
    name: 'Land',
    elementName: 'Terra / Earth',
    subtitle: 'Domínio Terrestre de Site',
    fileName: 'land(1).png',
    framePath: '/assets/frames/site/land(1).png',
    thumbnailPath: '/assets/frames/site/land(1).png',
    themeColor: {
      accent: '#7C5B32',
      border: 'border-[#7C5B32]',
      bgBadge: 'bg-[#7C5B32]/15',
      textBadge: 'text-[#5A3E1F]',
      ring: 'ring-[#7C5B32]',
    },
    description: 'Moldura horizontal exclusiva de Site com acabamento elemental da Terra (Earth).',
  },
];

/**
 * Retorna a lista apropriada de atributos para cada tipo de carta.
 * Para Site: retorna os 5 atributos exclusivos (Air, Water, Neutral, Fire, Land).
 * Para os demais tipos: retorna os 6 atributos padrão (Multi, Neutral, Land, Air, Fire, Water).
 */
export function getAttributesForType(cardType?: CardTypeId | null): CardAttributeDefinition[] {
  if (cardType === 'site') {
    return SITE_CARD_ATTRIBUTES;
  }
  return CARD_ATTRIBUTES;
}

/**
 * Determina se um tipo de carta requer a etapa de seleção de atributo.
 * Minion, Magic, Aura, Artifact e Site passam por essa etapa.
 * Avatar não passa.
 */
export function requiresAttributeSelection(cardType?: CardTypeId | null): boolean {
  return cardType === 'minion' || cardType === 'magic' || cardType === 'aura' || cardType === 'artifact' || cardType === 'site';
}

/**
 * Obtém a definição do atributo pelo seu ID e tipo de carta.
 */
export function getAttributeById(
  id?: CardAttributeId | string | null,
  cardType?: CardTypeId | null
): CardAttributeDefinition | undefined {
  if (!id) return undefined;
  const list = getAttributesForType(cardType);
  return list.find((attr) => attr.id.toLowerCase() === id.toLowerCase());
}

/**
 * Localiza a definição do atributo a partir da URL ou nome de arquivo da moldura.
 */
export function findAttributeByFrameUrl(
  url?: string | null,
  cardType?: CardTypeId | null
): CardAttributeDefinition | undefined {
  if (!url) return undefined;
  const clean = url.toLowerCase();
  const isSite = cardType === 'site' || clean.includes('/site/') || clean.includes('(1)');

  if (isSite) {
    return (
      SITE_CARD_ATTRIBUTES.find((attr) => {
        const fName = attr.fileName.toLowerCase();
        const id = attr.id.toLowerCase();
        return clean.includes(fName) || clean.includes(`/${id}(1).png`) || clean.endsWith(`/site/${id}.png`);
      }) ||
      SITE_CARD_ATTRIBUTES.find((attr) => clean.includes(attr.id.toLowerCase()))
    );
  }

  return CARD_ATTRIBUTES.find((attr) => {
    const fName = attr.fileName.toLowerCase();
    const id = attr.id.toLowerCase();
    return clean.includes(fName) || clean.endsWith(`/${id}.png`) || clean.includes(`/${id}_`);
  });
}

/**
 * Retorna o caminho canônico do arquivo de moldura para o atributo e tipo de carta.
 */
export function getFrameUrlForAttribute(attrId: CardAttributeId, cardType?: CardTypeId | null): string {
  if (cardType === 'site') {
    const siteAttr = SITE_CARD_ATTRIBUTES.find((a) => a.id === attrId);
    return siteAttr ? siteAttr.framePath : '/assets/frames/site/Neutral(1).png';
  }
  const attr = CARD_ATTRIBUTES.find((a) => a.id === attrId);
  return attr ? attr.framePath : '/assets/frames/Multi.png';
}

/**
 * Restringe os Thresholds elementais conforme o atributo e tipo de carta:
 *
 * PARA CARTAS SITE:
 * - Air: Apenas Air
 * - Water: Apenas Water
 * - Fire: Apenas Fire
 * - Land: Apenas Earth
 * - Neutral: Todos os Thresholds existentes (Air, Water, Fire, Earth, Espírito, Matéria, Vida, Vazio, Morte)
 *
 * PARA OS DEMAIS TIPOS (Minion, Magic, Aura, Artifact, Avatar):
 * - Regras originais 100% preservadas.
 */
export function getAllowedThresholdElements(
  attribute?: CardAttributeId | string | null,
  cardType?: CardTypeId | null
): import('./sorcery').SorceryElement[] {
  if (cardType === 'site') {
    if (!attribute) {
      return ['air', 'earth', 'fire', 'water', 'espirito', 'materia', 'vazio', 'vida', 'morte'];
    }
    switch (attribute.toLowerCase()) {
      case 'air':
        return ['air'];
      case 'water':
        return ['water'];
      case 'fire':
        return ['fire'];
      case 'land':
      case 'earth':
        return ['earth'];
      case 'neutral':
        return ['air', 'earth', 'fire', 'water', 'espirito', 'materia', 'vazio', 'vida', 'morte'];
      default:
        return ['air', 'earth', 'fire', 'water', 'espirito', 'materia', 'vazio', 'vida', 'morte'];
    }
  }

  // Comportamento original para os demais tipos de carta
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

