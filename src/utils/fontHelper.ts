import { FontFamilyType, TextBoxConfig } from '../types/card';

export interface FontDefinition {
  id: FontFamilyType;
  name: string;
  usage: string; // Descrição de uso (ex: "Títulos e classificações", "Descrições e habilidades")
  cssFamily: string; // Declaração CSS font-family
  isItalic: boolean;
  category: 'Fantasia & TCG' | 'Serifadas Clássicas' | 'Padrões';
}

export const AVAILABLE_FONTS: FontDefinition[] = [
  // --- 1. FONTES SOLICITADAS PARA CARD GAME ---
  {
    id: 'morpheus',
    name: 'Morpheus',
    usage: 'Títulos e classificações (Medieval / Fantasia)',
    cssFamily: "'Morpheus', Georgia, serif",
    isItalic: false,
    category: 'Fantasia & TCG',
  },
  {
    id: 'palatino',
    name: 'Palatino Regular',
    usage: 'Descrições e habilidades (Serifada clássica)',
    cssFamily: "'Palatino', 'Palatino Linotype', Georgia, serif",
    isItalic: false,
    category: 'Serifadas Clássicas',
  },
  {
    id: 'palatino-italic',
    name: 'Palatino Italic',
    usage: 'Textos narrativos e citações (Flavor text)',
    cssFamily: "'Palatino Italic', 'Palatino Linotype', 'Palatino', Georgia, serif",
    isItalic: true,
    category: 'Serifadas Clássicas',
  },
  {
    id: 'book-antiqua',
    name: 'Book Antiqua',
    usage: 'Texto de regras e corpo (Serifada alternativa)',
    cssFamily: "'Book Antiqua', 'Palatino', Georgia, serif",
    isItalic: false,
    category: 'Serifadas Clássicas',
  },
  {
    id: 'book-antiqua-italic',
    name: 'Book Antiqua Italic',
    usage: 'Citações e ênfase alternativa',
    cssFamily: "'Book Antiqua Italic', 'Book Antiqua', Georgia, serif",
    isItalic: true,
    category: 'Serifadas Clássicas',
  },

  // --- 2. FONTES ORIGINAIS PRESERVADAS ---
  {
    id: 'sans',
    name: 'Sem Serifa (Moderna)',
    usage: 'Texto limpo sem serifa (System UI)',
    cssFamily: 'system-ui, -apple-system, sans-serif',
    isItalic: false,
    category: 'Padrões',
  },
  {
    id: 'serif',
    name: 'Serifada Básica',
    usage: 'Serifada genérica (Georgia)',
    cssFamily: 'Georgia, serif',
    isItalic: false,
    category: 'Padrões',
  },
  {
    id: 'mono',
    name: 'Monoespaçada',
    usage: 'Numeração e atributos técnicos',
    cssFamily: 'ui-monospace, monospace',
    isItalic: false,
    category: 'Padrões',
  },
];

/**
 * Retorna as propriedades CSS (fontFamily e fontStyle) para aplicação inline na DOM
 */
export function getFontCssProperties(fontId: FontFamilyType): {
  fontFamily: string;
  fontStyle: 'normal' | 'italic';
} {
  const font = AVAILABLE_FONTS.find((f) => f.id === fontId);
  if (!font) {
    return {
      fontFamily: 'system-ui, sans-serif',
      fontStyle: 'normal',
    };
  }
  return {
    fontFamily: font.cssFamily,
    fontStyle: font.isItalic ? 'italic' : 'normal',
  };
}

/**
 * Formata a string de fonte para a API HTML5 Canvas 2D
 * Sintaxe padrão do canvas: "[font-style] [font-weight] [font-size]px [font-family]"
 */
export function getCanvasFontSpec(
  box: TextBoxConfig,
  scaledFontSizePx: number
): string {
  const font = AVAILABLE_FONTS.find((f) => f.id === box.fontFamily);
  const style = font?.isItalic ? 'italic' : 'normal';
  
  let weight = 'normal';
  if (box.fontWeight === 'bold') weight = 'bold';
  else if (box.fontWeight === 'black') weight = '900';
  else if (box.fontWeight === 'semibold') weight = '600';
  else if (box.fontWeight === 'medium') weight = '500';

  let family = 'system-ui, sans-serif';
  if (box.fontFamily === 'morpheus') {
    family = "'Morpheus', serif";
  } else if (box.fontFamily === 'palatino') {
    family = "'Palatino', 'Palatino Linotype', Georgia, serif";
  } else if (box.fontFamily === 'palatino-italic') {
    family = "'Palatino Italic', 'Palatino', Georgia, serif";
  } else if (box.fontFamily === 'book-antiqua') {
    family = "'Book Antiqua', 'Palatino', Georgia, serif";
  } else if (box.fontFamily === 'book-antiqua-italic') {
    family = "'Book Antiqua Italic', 'Book Antiqua', Georgia, serif";
  } else if (box.fontFamily === 'serif') {
    family = 'Georgia, serif';
  } else if (box.fontFamily === 'mono') {
    family = 'monospace';
  }

  return `${style} ${weight} ${scaledFontSizePx}px ${family}`;
}

/**
 * Garante o carregamento antecipado de todas as fontes customizadas no navegador
 * e aguarda a prontidão da API document.fonts para renderização no Canvas sem falhas.
 */
export async function ensureAllFontsLoaded(): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;

  const fontLoads = [
    document.fonts.load('16px "Morpheus"'),
    document.fonts.load('16px "Palatino"'),
    document.fonts.load('italic 16px "Palatino"'),
    document.fonts.load('italic 16px "Palatino Italic"'),
    document.fonts.load('16px "Book Antiqua"'),
    document.fonts.load('italic 16px "Book Antiqua"'),
    document.fonts.load('italic 16px "Book Antiqua Italic"'),
  ];

  try {
    await Promise.allSettled(fontLoads);
    await document.fonts.ready;
  } catch {
    // Se a API falhar silenciosamente, o fallback de fontes do sistema atua
  }
}
