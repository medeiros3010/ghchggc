import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  CARD_PRESETS,
  TextBoxConfig,
} from '../types/card';
import { CardLayoutPreset } from '../types/preset';
import {
  DEFAULT_CARD_FRAME,
  DEFAULT_CARD_SYMBOLS,
  DEFAULT_MANA_SYMBOL,
  DEFAULT_ATTACK_SYMBOL,
  DEFAULT_TCG_TEXT_BOXES,
  DEFAULT_SITE_TEXT_BOXES,
  SAMPLE_CARDFRAME_SVG,
  SAMPLE_MANA_SVG,
  SAMPLE_ATTACK_SVG,
} from './cardDefaults';
import { DEFAULT_SORCERY_CONFIG, SITE_DEFAULT_SORCERY_CONFIG, SorceryIndicatorsConfig } from '../types/sorcery';

const STORAGE_KEY = 'cardforge_card_layout_presets_v1';

/**
 * Gera um SVG leve e visualmente fiel do layout da carta para servir de miniatura.
 * REGRA CRÍTICA: Nunca renderiza e nunca incorpora a arte principal da carta.
 */
export function generatePresetThumbnailSvg(
  preset: Pick<CardLayoutPreset, 'dimensions' | 'artLayout' | 'frameConfig' | 'symbolsConfig' | 'textBoxes'>
): string {
  const width = 160;
  const height = Math.round(width / preset.dimensions.aspectRatio);
  const scale = width / 360;
  const radius = Math.round((preset.dimensions.borderRadiusPx || 14) * scale);

  // Área da arte
  let artAreaSvg = '';
  if (preset.artLayout.mode === 'framed') {
    const fx = (preset.artLayout.frameMarginPercent / 100) * width;
    const fy = (preset.artLayout.frameTopPercent / 100) * height;
    const fw = ((100 - preset.artLayout.frameMarginPercent * 2) / 100) * width;
    const fh = (preset.artLayout.frameHeightPercent / 100) * height;
    artAreaSvg = `
      <rect x="${fx}" y="${fy}" width="${fw}" height="${fh}" rx="3" fill="#f1f5f9" stroke="#94a3b8" stroke-width="1.2" stroke-dasharray="3 2"/>
      <text x="${fx + fw / 2}" y="${fy + fh / 2 + 3}" font-family="sans-serif" font-size="7" fill="#94a3b8" text-anchor="middle">ÁREA DE ARTE</text>
    `;
  } else {
    artAreaSvg = `
      <rect x="4" y="4" width="${width - 8}" height="${height - 8}" rx="${radius}" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 3"/>
      <text x="${width / 2}" y="${height * 0.35}" font-family="sans-serif" font-size="7" fill="#94a3b8" text-anchor="middle">FULL-BLEED ART</text>
    `;
  }

  // Símbolos (Mana & Ataque)
  const mana = preset.symbolsConfig?.manaSymbol;
  let manaSvg = '';
  if (mana && mana.isVisible) {
    const mx = (mana.xPercent / 100) * width;
    const my = (mana.yPercent / 100) * height;
    const mw = (mana.widthPercent / 100) * width;
    const mh = (mana.heightPercent / 100) * height;
    manaSvg = `
      <circle cx="${mx + mw / 2}" cy="${my + mh / 2}" r="${Math.min(mw, mh) / 2}" fill="#38bdf8" stroke="#0284c7" stroke-width="1" opacity="${mana.opacity}"/>
    `;
  }

  const atk = preset.symbolsConfig?.attackSymbol;
  let atkSvg = '';
  if (atk && atk.isVisible) {
    const ax = (atk.xPercent / 100) * width;
    const ay = (atk.yPercent / 100) * height;
    const aw = (atk.widthPercent / 100) * width;
    const ah = (atk.heightPercent / 100) * height;
    atkSvg = `
      <circle cx="${ax + aw / 2}" cy="${ay + ah / 2}" r="${Math.min(aw, ah) / 2}" fill="#f87171" stroke="#dc2626" stroke-width="1" opacity="${atk.opacity}"/>
    `;
  }

  // Caixas de texto
  const boxesSvg = preset.textBoxes
    .filter((b) => b.isVisible)
    .map((box) => {
      const bx = (box.xPercent / 100) * width;
      const by = (box.yPercent / 100) * height;
      const bw = (box.widthPercent / 100) * width;
      const bh = box.heightPercent ? (box.heightPercent / 100) * height : 14 * scale;
      const bg = box.bgColor && box.bgColor !== 'transparent' ? box.bgColor : 'rgba(241, 245, 249, 0.7)';
      const border = box.borderColor || '#cbd5e1';

      return `
        <rect x="${bx}" y="${by}" width="${bw}" height="${bh}" rx="${Math.max(1, (box.borderRadiusPx || 4) * scale)}" fill="${bg}" stroke="${border}" stroke-width="0.8"/>
        <line x1="${bx + 3}" y1="${by + bh / 2}" x2="${bx + bw - 3}" y2="${by + bh / 2}" stroke="${box.textColor || '#475569'}" stroke-width="1.2" opacity="0.6"/>
      `;
    })
    .join('');

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
      <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius}" fill="#ffffff" stroke="#1e293b" stroke-width="2"/>
      ${artAreaSvg}
      ${manaSvg}
      ${atkSvg}
      ${boxesSvg}
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

/**
 * Modelos Iniciais Padrão (Built-in Presets)
 */
export const BUILT_IN_PRESETS: CardLayoutPreset[] = [
  {
    id: 'builtin-layout-v4',
    version: 1,
    name: 'Layout v4 (Padrão)',
    description: 'Layout padrão oficial com 4 caixas de texto otimizadas, sangria total, contornos Morpheus e indicadores de Sorcery.',
    createdAt: '2026-10-19T23:36:58.025Z',
    updatedAt: '2026-10-19T23:36:58.025Z',
    isBuiltIn: true,
    dimensions: CARD_PRESETS.standardTCG,
    artLayout: {
      mode: 'full-bleed',
      fit: 'cover',
      opacity: 1,
      frameTopPercent: 13,
      frameHeightPercent: 41,
      frameMarginPercent: 6,
    },
    frameConfig: {
      imageUrl: null,
      opacity: 1,
      fit: 'fill',
      isVisible: true,
    },
    symbolsConfig: DEFAULT_CARD_SYMBOLS,
    textBoxes: DEFAULT_TCG_TEXT_BOXES,
    sorceryConfig: DEFAULT_SORCERY_CONFIG,
    requiredFonts: ['morpheus', 'book-antiqua', 'palatino-italic'],
  },
  {
    id: 'builtin-site-standard',
    version: 1,
    name: 'Site Atlas (Padrão 63×88mm)',
    description: 'Layout oficial para cartas Site: proporção padrão Sorcery 63 × 88 mm, Mana e Threshold no topo esquerdo, Combate no topo direito e caixas distribuídas.',
    createdAt: '2026-10-20T00:00:00.000Z',
    updatedAt: '2026-10-20T00:00:00.000Z',
    isBuiltIn: true,
    dimensions: CARD_PRESETS.site,
    artLayout: {
      mode: 'full-bleed',
      fit: 'cover',
      opacity: 1,
      frameTopPercent: 13,
      frameHeightPercent: 41,
      frameMarginPercent: 6,
    },
    frameConfig: {
      imageUrl: null,
      opacity: 1,
      fit: 'fill',
      isVisible: true,
    },
    symbolsConfig: DEFAULT_CARD_SYMBOLS,
    textBoxes: DEFAULT_SITE_TEXT_BOXES,
    sorceryConfig: SITE_DEFAULT_SORCERY_CONFIG,
    requiredFonts: ['fantaisie-artistique', 'book-antiqua', 'palatino-italic'],
  },
  {
    id: 'builtin-tcg-classic',
    version: 1,
    name: 'TCG Clássico (Fantasia & Moldura)',
    description: 'Layout clássico estilo Magic/Hearthstone com Cardframe ornamentado, títulos em Morpheus, símbolos de mana e regras com entrelinha otimizada.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
    dimensions: CARD_PRESETS.standardTCG,
    artLayout: {
      mode: 'framed',
      fit: 'cover',
      opacity: 1,
      frameTopPercent: 13,
      frameHeightPercent: 41,
      frameMarginPercent: 6,
    },
    frameConfig: {
      imageUrl: SAMPLE_CARDFRAME_SVG,
      opacity: 1,
      fit: 'fill',
      isVisible: true,
    },
    symbolsConfig: {
      manaSymbol: {
        ...DEFAULT_MANA_SYMBOL,
        imageUrl: SAMPLE_MANA_SVG,
        isVisible: true,
      },
      attackSymbol: {
        ...DEFAULT_ATTACK_SYMBOL,
        imageUrl: SAMPLE_ATTACK_SVG,
        isVisible: true,
      },
    },
    textBoxes: DEFAULT_TCG_TEXT_BOXES,
    requiredFonts: ['morpheus', 'palatino', 'book-antiqua', 'mono'],
  },
  {
    id: 'builtin-full-art',
    version: 1,
    name: 'Full-Art Moderno (Sem Moldura)',
    description: 'Layout moderno com sangria total (100% de fundo), caixas de texto translúcidas escuras e tipografia limpa.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
    dimensions: CARD_PRESETS.standardTCG,
    artLayout: {
      mode: 'full-bleed',
      fit: 'cover',
      opacity: 1,
      frameTopPercent: 0,
      frameHeightPercent: 100,
      frameMarginPercent: 0,
    },
    frameConfig: {
      imageUrl: null,
      opacity: 1,
      fit: 'fill',
      isVisible: false,
    },
    symbolsConfig: {
      manaSymbol: {
        ...DEFAULT_MANA_SYMBOL,
        xPercent: 6,
        yPercent: 4,
        imageUrl: SAMPLE_MANA_SVG,
        isVisible: true,
      },
      attackSymbol: {
        ...DEFAULT_ATTACK_SYMBOL,
        xPercent: 86,
        yPercent: 4,
        imageUrl: SAMPLE_ATTACK_SVG,
        isVisible: true,
      },
    },
    textBoxes: [
      {
        id: 'box-fa-title',
        name: 'Nome da Carta',
        content: 'Avatar das Estrelas',
        xPercent: 6,
        yPercent: 4.5,
        widthPercent: 72,
        heightPercent: 6,
        fontSizePx: 18,
        fontWeight: 'bold',
        fontFamily: 'morpheus',
        textAlign: 'left',
        textColor: '#f8fafc',
        bgColor: 'rgba(15, 23, 42, 0.75)',
        borderColor: '#475569',
        borderWidthPx: 1,
        borderRadiusPx: 8,
        paddingPx: 6,
        isLocked: false,
        isMultiline: false,
        isVisible: true,
        letterSpacingPx: 0.5,
      },
      {
        id: 'box-fa-type',
        name: 'Tipo / Subtipo',
        content: 'Entidade Cósmica — Rara',
        xPercent: 6,
        yPercent: 64,
        widthPercent: 88,
        heightPercent: 5,
        fontSizePx: 12,
        fontWeight: 'semibold',
        fontFamily: 'book-antiqua',
        textAlign: 'left',
        textColor: '#e2e8f0',
        bgColor: 'rgba(15, 23, 42, 0.8)',
        borderColor: '#334155',
        borderWidthPx: 1,
        borderRadiusPx: 6,
        paddingPx: 4,
        isLocked: false,
        isMultiline: false,
        isVisible: true,
      },
      {
        id: 'box-fa-rules',
        name: 'Habilidades & Efeito',
        content: 'Lampejo, Voar.\nQuando esta entidade entra em campo de batalha, anule a magia alvo a menos que seu controlador pague 2 pontos de energia.',
        xPercent: 6,
        yPercent: 71,
        widthPercent: 88,
        heightPercent: 18,
        fontSizePx: 12,
        fontWeight: 'normal',
        fontFamily: 'palatino',
        textAlign: 'left',
        textColor: '#f1f5f9',
        bgColor: 'rgba(15, 23, 42, 0.85)',
        borderColor: '#334155',
        borderWidthPx: 1,
        borderRadiusPx: 8,
        paddingPx: 8,
        isLocked: false,
        isMultiline: true,
        isVisible: true,
        lineHeight: 1.3,
        paragraphSpacingPx: 4,
      },
      {
        id: 'box-fa-stats',
        name: 'Poder / Resistência',
        content: '4 / 4',
        xPercent: 74,
        yPercent: 90,
        widthPercent: 20,
        heightPercent: 5.5,
        fontSizePx: 15,
        fontWeight: 'black',
        fontFamily: 'mono',
        textAlign: 'center',
        textColor: '#ffffff',
        bgColor: 'rgba(225, 29, 72, 0.9)',
        borderColor: '#fda4af',
        borderWidthPx: 2,
        borderRadiusPx: 6,
        paddingPx: 2,
        isLocked: false,
        isMultiline: false,
        isVisible: true,
      },
    ],
    requiredFonts: ['morpheus', 'palatino', 'book-antiqua', 'mono'],
  },
  {
    id: 'builtin-spell-arcane',
    version: 1,
    name: 'Feitiço & Magia Arcana',
    description: 'Layout especializado para magias, rituais e encantamentos com caixa de lore expandida e citações em Palatino Italic.',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    isBuiltIn: true,
    dimensions: CARD_PRESETS.standardTCG,
    artLayout: {
      mode: 'framed',
      fit: 'cover',
      opacity: 1,
      frameTopPercent: 12,
      frameHeightPercent: 38,
      frameMarginPercent: 8,
    },
    frameConfig: {
      imageUrl: null,
      opacity: 1,
      fit: 'fill',
      isVisible: false,
    },
    symbolsConfig: {
      manaSymbol: {
        ...DEFAULT_MANA_SYMBOL,
        xPercent: 7,
        yPercent: 4.5,
        imageUrl: SAMPLE_MANA_SVG,
        isVisible: true,
      },
      attackSymbol: {
        ...DEFAULT_ATTACK_SYMBOL,
        isVisible: false,
      },
    },
    textBoxes: [
      {
        id: 'box-spell-name',
        name: 'Nome do Feitiço',
        content: 'Chuva de Meteoros Arcanos',
        xPercent: 18,
        yPercent: 4.5,
        widthPercent: 75,
        heightPercent: 6,
        fontSizePx: 16,
        fontWeight: 'bold',
        fontFamily: 'morpheus',
        textAlign: 'left',
        textColor: '#1e1b4b',
        bgColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#a5b4fc',
        borderWidthPx: 1.5,
        borderRadiusPx: 6,
        paddingPx: 5,
        isLocked: false,
        isMultiline: false,
        isVisible: true,
      },
      {
        id: 'box-spell-type',
        name: 'Tipo de Magia',
        content: 'Feitiço Lendário — Evocação',
        xPercent: 8,
        yPercent: 52,
        widthPercent: 84,
        heightPercent: 5,
        fontSizePx: 12,
        fontWeight: 'semibold',
        fontFamily: 'book-antiqua',
        textAlign: 'center',
        textColor: '#3730a3',
        bgColor: 'rgba(238, 242, 255, 0.95)',
        borderColor: '#c7d2fe',
        borderWidthPx: 1,
        borderRadiusPx: 4,
        paddingPx: 4,
        isLocked: false,
        isMultiline: false,
        isVisible: true,
      },
      {
        id: 'box-spell-effect',
        name: 'Efeito Mágico & Regras',
        content: 'Causa 5 pontos de dano divididos a sua escolha entre quaisquer alvos.\n\n"Quando o céu se rasga em chamas violetas, até os deuses fecham seus olhos."',
        xPercent: 8,
        yPercent: 59,
        widthPercent: 84,
        heightPercent: 32,
        fontSizePx: 12,
        fontWeight: 'normal',
        fontFamily: 'palatino-italic',
        textAlign: 'left',
        textColor: '#1f2937',
        bgColor: 'rgba(255, 255, 255, 0.94)',
        borderColor: '#cbd5e1',
        borderWidthPx: 1,
        borderRadiusPx: 6,
        paddingPx: 8,
        isLocked: false,
        isMultiline: true,
        isVisible: true,
        lineHeight: 1.35,
        paragraphSpacingPx: 8,
      },
    ],
    requiredFonts: ['morpheus', 'palatino-italic', 'book-antiqua'],
  },
];

/**
 * Lê os modelos salvos no armazenamento local persistente (localStorage).
 * Se for a primeira execução ou estiver vazio, inicializa com os modelos embutidos.
 */
export function getStoredPresets(): CardLayoutPreset[] {
  if (typeof window === 'undefined' || !window.localStorage) {
    return BUILT_IN_PRESETS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Salva os modelos padrão iniciais
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(BUILT_IN_PRESETS));
      return BUILT_IN_PRESETS;
    }

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Preserva modelos personalizados criados pelo usuário sem sobrescrevê-los
      const userCustom = parsed.filter((p: CardLayoutPreset) => !p.isBuiltIn);
      const builtInIds = new Set(BUILT_IN_PRESETS.map((p) => p.id));
      const filteredCustom = userCustom.filter((p: CardLayoutPreset) => !builtInIds.has(p.id));
      return [...BUILT_IN_PRESETS, ...filteredCustom];
    }

    return BUILT_IN_PRESETS;
  } catch (e) {
    console.error('Falha ao carregar modelos do localStorage:', e);
    return BUILT_IN_PRESETS;
  }
}

/**
 * Salva a lista completa de modelos no armazenamento persistente.
 */
export function persistPresets(presets: CardLayoutPreset[]): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(presets));
  } catch (e) {
    console.error('Falha ao persistir modelos no localStorage:', e);
  }
}

/**
 * CRIAÇÃO DE MODELO A PARTIR DO ESTADO ATUAL DA CARTA
 * ===================================================
 * REGRA FUNDAMENTAL E ABSOLUTA:
 * O modelo salva absolutamente tudo (dimensões, cardframe, mana,
 * ataque, caixas de texto, fontes, espaçamentos, posições),
 * EXCETO a arte principal da carta (artConfig.imageUrl é sempre omitido).
 */
export function createPresetFromState(params: {
  name: string;
  description?: string;
  dimensions: CardDimensionsConfig;
  artConfig: CardArtConfig;
  frameConfig: CardFrameConfig;
  symbolsConfig: CardSymbolsConfig;
  textBoxes: TextBoxConfig[];
  sorceryConfig?: SorceryIndicatorsConfig;
  existingId?: string;
}): CardLayoutPreset {
  const now = new Date().toISOString();

  // 1. Extração da configuração de layout de arte SEM A IMAGEM PRINCIPAL
  const artLayout = {
    mode: params.artConfig.mode,
    fit: params.artConfig.fit,
    opacity: params.artConfig.opacity,
    frameTopPercent: params.artConfig.frameTopPercent,
    frameHeightPercent: params.artConfig.frameHeightPercent,
    frameMarginPercent: params.artConfig.frameMarginPercent,
  };

  // 2. Extração de fontes utilizadas
  const usedFonts = Array.from(new Set(params.textBoxes.map((b) => b.fontFamily)));

  // 3. Montagem do modelo autossuficiente
  const newPreset: CardLayoutPreset = {
    id: params.existingId || `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    version: 1,
    name: params.name.trim(),
    description: params.description?.trim() || undefined,
    createdAt: now,
    updatedAt: now,
    isBuiltIn: false,
    dimensions: { ...params.dimensions },
    artLayout,
    frameConfig: { ...params.frameConfig },
    symbolsConfig: {
      manaSymbol: { ...params.symbolsConfig.manaSymbol },
      attackSymbol: { ...params.symbolsConfig.attackSymbol },
    },
    textBoxes: params.textBoxes.map((box) => ({ ...box })),
    sorceryConfig: params.sorceryConfig ? JSON.parse(JSON.stringify(params.sorceryConfig)) : undefined,
    requiredFonts: usedFonts,
  };

  return newPreset;
}

/**
 * Salva um novo modelo na biblioteca interna persistente.
 */
export function saveNewPreset(preset: CardLayoutPreset): CardLayoutPreset[] {
  const current = getStoredPresets();
  const updated = [preset, ...current];
  persistPresets(updated);
  return updated;
}

/**
 * Atualiza um modelo existente com novas configurações.
 */
export function updateExistingPreset(
  id: string,
  updatedData: Partial<CardLayoutPreset>
): CardLayoutPreset[] {
  const current = getStoredPresets();
  const updated = current.map((p) => {
    if (p.id === id) {
      return {
        ...p,
        ...updatedData,
        isBuiltIn: false, // se foi editado pelo usuário, vira customizado
        updatedAt: new Date().toISOString(),
      };
    }
    return p;
  });
  persistPresets(updated);
  return updated;
}

/**
 * Duplica um modelo existente com sufixo "(Cópia)".
 */
export function duplicatePreset(id: string): { presets: CardLayoutPreset[]; newPreset: CardLayoutPreset | null } {
  const current = getStoredPresets();
  const target = current.find((p) => p.id === id);
  if (!target) return { presets: current, newPreset: null };

  const now = new Date().toISOString();
  const cloned: CardLayoutPreset = {
    ...target,
    id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    name: `${target.name} (Cópia)`,
    isBuiltIn: false,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [cloned, ...current];
  persistPresets(updated);
  return { presets: updated, newPreset: cloned };
}

/**
 * Exclui um modelo da biblioteca.
 */
export function deletePreset(id: string): CardLayoutPreset[] {
  const current = getStoredPresets();
  const updated = current.filter((p) => p.id !== id);
  persistPresets(updated);
  return updated;
}

/**
 * EXPORTAÇÃO DO MODELO EM ARQUIVO JSON INDEPENDENTE
 * =================================================
 * Gera um arquivo JSON autossuficiente para download imediato.
 * Assegura que nenhuma arte de ilustração seja vazada no JSON.
 */
export function exportPresetAsJson(preset: CardLayoutPreset): void {
  // Garantia rigorosa: artLayout não possui imageUrl
  const cleanExport = {
    _format: 'cardforge-card-preset',
    version: preset.version || 1,
    exportedAt: new Date().toISOString(),
    name: preset.name,
    description: preset.description || '',
    dimensions: preset.dimensions,
    artLayout: {
      mode: preset.artLayout.mode,
      fit: preset.artLayout.fit,
      opacity: preset.artLayout.opacity,
      frameTopPercent: preset.artLayout.frameTopPercent,
      frameHeightPercent: preset.artLayout.frameHeightPercent,
      frameMarginPercent: preset.artLayout.frameMarginPercent,
    },
    frameConfig: preset.frameConfig,
    symbolsConfig: preset.symbolsConfig,
    textBoxes: preset.textBoxes,
    sorceryConfig: preset.sorceryConfig,
    requiredFonts: preset.requiredFonts || [],
  };

  const jsonString = JSON.stringify(cleanExport, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const safeFilename = `modelo-${preset.name.toLowerCase().replace(/[^a-z0-9]/gi, '_')}.json`;

  const link = document.createElement('a');
  link.href = url;
  link.download = safeFilename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * VALIDAÇÃO E PARSER DE ARQUIVO JSON DE MODELO
 */
export function parseAndValidatePresetFile(
  jsonText: string
): { success: true; preset: CardLayoutPreset } | { success: false; error: string } {
  try {
    const data = JSON.parse(jsonText);

    if (!data || typeof data !== 'object') {
      return { success: false, error: 'O arquivo não contém um objeto JSON válido.' };
    }

    if (!data.name || typeof data.name !== 'string') {
      return { success: false, error: 'O modelo deve conter a propriedade "name" (nome).' };
    }

    if (!data.dimensions || typeof data.dimensions.aspectRatio !== 'number') {
      return { success: false, error: 'Configuração de dimensões ("dimensions") ausente ou inválida.' };
    }

    if (!Array.isArray(data.textBoxes)) {
      return { success: false, error: 'O modelo precisa conter a lista de caixas de texto ("textBoxes").' };
    }

    // Normalização com remoção preventiva de qualquer art.imageUrl que pudesse ter sido injetada
    const now = new Date().toISOString();
    const artLayout = data.artLayout || {
      mode: 'framed',
      fit: 'cover',
      opacity: 1,
      frameTopPercent: 13,
      frameHeightPercent: 41,
      frameMarginPercent: 6,
    };

    const frameConfig = data.frameConfig || {
      imageUrl: null,
      opacity: 1,
      fit: 'fill',
      isVisible: false,
    };

    const symbolsConfig = data.symbolsConfig || DEFAULT_CARD_SYMBOLS;

    const validatedPreset: CardLayoutPreset = {
      id: `preset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      version: 1,
      name: data.name.trim(),
      description: data.description || '',
      createdAt: data.createdAt || now,
      updatedAt: now,
      isBuiltIn: false,
      dimensions: data.dimensions,
      artLayout: {
        mode: artLayout.mode || 'framed',
        fit: artLayout.fit || 'cover',
        opacity: typeof artLayout.opacity === 'number' ? artLayout.opacity : 1,
        frameTopPercent: typeof artLayout.frameTopPercent === 'number' ? artLayout.frameTopPercent : 13,
        frameHeightPercent: typeof artLayout.frameHeightPercent === 'number' ? artLayout.frameHeightPercent : 41,
        frameMarginPercent: typeof artLayout.frameMarginPercent === 'number' ? artLayout.frameMarginPercent : 6,
      },
      frameConfig: {
        imageUrl: frameConfig.imageUrl || null,
        opacity: typeof frameConfig.opacity === 'number' ? frameConfig.opacity : 1,
        fit: frameConfig.fit || 'fill',
        isVisible: typeof frameConfig.isVisible === 'boolean' ? frameConfig.isVisible : true,
      },
      symbolsConfig: {
        manaSymbol: symbolsConfig.manaSymbol || DEFAULT_MANA_SYMBOL,
        attackSymbol: symbolsConfig.attackSymbol || DEFAULT_ATTACK_SYMBOL,
      },
      textBoxes: data.textBoxes,
      sorceryConfig: data.sorceryConfig || undefined,
      requiredFonts: Array.isArray(data.requiredFonts) ? data.requiredFonts : [],
    };

    return { success: true, preset: validatedPreset };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha ao processar arquivo JSON.';
    return { success: false, error: `Erro de sintaxe no arquivo JSON: ${msg}` };
  }
}
