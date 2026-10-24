/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gerenciador e Parser de Símbolos em Caixas de Texto
 * =========================================================================
 * Inspirado no menu "Symbols" do Sorcerer's Spellbook.
 * Permite inserção e renderização inline de símbolos de Threshold (Air, Earth, Fire, Water)
 * e outros caracteres especiais (como a seta →) diretamente nas frases das cartas.
 */

import React from 'react';

export type ThresholdSymbolType =
  | 'air'
  | 'earth'
  | 'fire'
  | 'water'
  | 'vida'
  | 'morte'
  | 'espirito'
  | 'materia'
  | 'vazio';

export interface TextSymbolItem {
  id: string;
  label: string;
  code: string;
  category: 'threshold' | 'other';
  subcategory?: 'original' | 'custom';
  iconUrl?: string;
  textChar?: string;
  description: string;
}

export const TEXT_SYMBOLS: TextSymbolItem[] = [
  // 1. Categoria: Thresholds Originais (4)
  {
    id: 'symbol-air',
    label: 'Air',
    code: '{air}',
    category: 'threshold',
    subcategory: 'original',
    iconUrl: '/assets/sorcery/threshold_air.png',
    description: 'Símbolo Elemental de Ar',
  },
  {
    id: 'symbol-earth',
    label: 'Earth',
    code: '{earth}',
    category: 'threshold',
    subcategory: 'original',
    iconUrl: '/assets/sorcery/threshold_earth.png',
    description: 'Símbolo Elemental de Terra',
  },
  {
    id: 'symbol-fire',
    label: 'Fire',
    code: '{fire}',
    category: 'threshold',
    subcategory: 'original',
    iconUrl: '/assets/sorcery/threshold_fire.png',
    description: 'Símbolo Elemental de Fogo',
  },
  {
    id: 'symbol-water',
    label: 'Water',
    code: '{water}',
    category: 'threshold',
    subcategory: 'original',
    iconUrl: '/assets/sorcery/threshold_water.png',
    description: 'Símbolo Elemental de Água',
  },

  // 2. Categoria: Thresholds Personalizados (5)
  {
    id: 'symbol-vida',
    label: 'Vida',
    code: '{vida}',
    category: 'threshold',
    subcategory: 'custom',
    iconUrl: '/assets/sorcery/Vida.png',
    description: 'Símbolo Elemental de Vida',
  },
  {
    id: 'symbol-morte',
    label: 'Morte',
    code: '{morte}',
    category: 'threshold',
    subcategory: 'custom',
    iconUrl: '/assets/sorcery/Morte.png',
    description: 'Símbolo Elemental de Morte',
  },
  {
    id: 'symbol-espirito',
    label: 'Espírito',
    code: '{espirito}',
    category: 'threshold',
    subcategory: 'custom',
    iconUrl: '/assets/sorcery/Espirito.png',
    description: 'Símbolo Elemental de Espírito',
  },
  {
    id: 'symbol-materia',
    label: 'Matéria',
    code: '{materia}',
    category: 'threshold',
    subcategory: 'custom',
    iconUrl: '/assets/sorcery/Matéria.png',
    description: 'Símbolo Elemental de Matéria',
  },
  {
    id: 'symbol-vazio',
    label: 'Vazio',
    code: '{vazio}',
    category: 'threshold',
    subcategory: 'custom',
    iconUrl: '/assets/sorcery/Vazio.png',
    description: 'Símbolo Elemental de Vazio',
  },

  // 3. Categoria: Outros
  {
    id: 'symbol-arrow',
    label: 'Seta',
    code: '→',
    category: 'other',
    textChar: '→',
    description: 'Seta para a direita (→)',
  },
];

export const THRESHOLD_IMAGE_MAP: Record<ThresholdSymbolType, string> = {
  air: '/assets/sorcery/threshold_air.png',
  earth: '/assets/sorcery/threshold_earth.png',
  fire: '/assets/sorcery/threshold_fire.png',
  water: '/assets/sorcery/threshold_water.png',
  vida: '/assets/sorcery/Vida.png',
  morte: '/assets/sorcery/Morte.png',
  espirito: '/assets/sorcery/Espirito.png',
  materia: '/assets/sorcery/Matéria.png',
  vazio: '/assets/sorcery/Vazio.png',
};

// Regex para detectar códigos de símbolos no texto (suporta variações em português/inglês)
export const SYMBOL_TAG_REGEX = /\{(air|earth|fire|water|ar|terra|fogo|agua|água|vida|morte|espirito|espírito|materia|matéria|vazio|life|death|spirit|matter|void)\}/gi;

/**
 * Normaliza um identificador de elemento encontrado em tag para o tipo padrão.
 */
export function normalizeThresholdElement(tag: string): ThresholdSymbolType | null {
  const clean = tag.replace(/[{}]/g, '').trim().toLowerCase();
  switch (clean) {
    case 'air':
    case 'ar':
      return 'air';
    case 'earth':
    case 'terra':
      return 'earth';
    case 'fire':
    case 'fogo':
      return 'fire';
    case 'water':
    case 'agua':
    case 'água':
      return 'water';
    case 'vida':
    case 'life':
      return 'vida';
    case 'morte':
    case 'death':
      return 'morte';
    case 'espirito':
    case 'espírito':
    case 'spirit':
      return 'espirito';
    case 'materia':
    case 'matéria':
      return 'materia';
    case 'vazio':
    case 'void':
      return 'vazio';
    default:
      return null;
  }
}

export type ParsedTextChunk =
  | { type: 'text'; text: string }
  | { type: 'symbol'; element: ThresholdSymbolType; code: string };

/**
 * Divide uma string em partes de texto comum e símbolos de threshold.
 */
export function parseTextWithSymbols(rawText: string): ParsedTextChunk[] {
  if (!rawText) return [];

  const chunks: ParsedTextChunk[] = [];
  let lastIndex = 0;
  const regex = /\{(air|earth|fire|water|ar|terra|fogo|agua|água|vida|morte|espirito|espírito|materia|matéria|vazio|life|death|spirit|matter|void)\}/gi;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    if (match.index > lastIndex) {
      chunks.push({
        type: 'text',
        text: rawText.substring(lastIndex, match.index),
      });
    }

    const element = normalizeThresholdElement(match[0]);
    if (element) {
      chunks.push({
        type: 'symbol',
        element,
        code: match[0],
      });
    } else {
      chunks.push({
        type: 'text',
        text: match[0],
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < rawText.length) {
    chunks.push({
      type: 'text',
      text: rawText.substring(lastIndex),
    });
  }

  return chunks;
}

/**
 * Renderiza texto com símbolos de threshold inline para uso na árvore React (CardCanvas e prévias).
 */
export function renderFormattedTextWithSymbols(
  text: string,
  keyPrefix = 'fmt'
): React.ReactNode {
  if (!text) return null;

  const chunks = parseTextWithSymbols(text);

  return chunks.map((chunk, index) => {
    const chunkKey = `${keyPrefix}-${index}`;

    if (chunk.type === 'symbol') {
      const iconUrl = THRESHOLD_IMAGE_MAP[chunk.element];
      return (
        <span
          key={chunkKey}
          className="inline-flex items-center justify-center align-middle select-none pointer-events-none"
          style={{
            display: 'inline-block',
            verticalAlign: '-0.14em',
            margin: '0 0.12em',
            lineHeight: 1,
          }}
          title={chunk.element.toUpperCase()}
        >
          <img
            src={iconUrl}
            alt={chunk.element}
            className="inline-block object-contain"
            style={{
              height: '1.08em',
              width: 'auto',
              maxWidth: '1.25em',
              filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.45))',
              display: 'block',
            }}
          />
        </span>
      );
    }

    // Texto com proteção para rendering consistente da seta →
    if (chunk.text.includes('→')) {
      const parts = chunk.text.split(/(→)/g);
      return (
        <span key={chunkKey}>
          {parts.map((p, pIdx) => {
            if (p === '→') {
              return (
                <span
                  key={`${chunkKey}-arrow-${pIdx}`}
                  style={{
                    fontFamily: 'system-ui, -apple-system, "Segoe UI Symbol", sans-serif',
                    fontWeight: 'bold',
                    margin: '0 0.08em',
                  }}
                >
                  →
                </span>
              );
            }
            return p;
          })}
        </span>
      );
    }

    return <span key={chunkKey}>{chunk.text}</span>;
  });
}

/**
 * Insere um código de símbolo na posição exata do cursor de um input ou textarea.
 * Se houver seleção, substitui a seleção mantendo o restante do conteúdo.
 * Reposiciona o cursor imediatamente após o símbolo inserido e preserva o foco.
 */
export function insertSymbolIntoInputElement(
  element: HTMLInputElement | HTMLTextAreaElement | null,
  symbolCode: string,
  currentValue: string,
  onChange: (newValue: string) => void
): void {
  if (!element) {
    onChange(currentValue + symbolCode);
    return;
  }

  const start = element.selectionStart ?? currentValue.length;
  const end = element.selectionEnd ?? currentValue.length;

  const newValue = currentValue.slice(0, start) + symbolCode + currentValue.slice(end);
  onChange(newValue);

  // Mantém o foco e avança o cursor imediatamente para após o símbolo
  requestAnimationFrame(() => {
    element.focus();
    const newCursorPos = start + symbolCode.length;
    try {
      element.setSelectionRange(newCursorPos, newCursorPos);
    } catch {}
  });
}

/**
 * Mede a largura precisa de uma string que contém texto e símbolos de Threshold para canvas
 */
export function measureStringWithSymbols(
  ctx: CanvasRenderingContext2D,
  str: string,
  fontSize: number
): number {
  if (!str) return 0;
  const chunks = parseTextWithSymbols(str);
  let total = 0;
  for (const chunk of chunks) {
    if (chunk.type === 'symbol') {
      const iconSize = fontSize * 1.05;
      const margin = fontSize * 0.12;
      total += iconSize + margin * 2;
    } else {
      total += ctx.measureText(chunk.text).width;
    }
  }
  return total;
}
