/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gerenciador de Estados Independentes por Tipo de Carta
 * =========================================================================
 * Garante que cada tipo de carta (Minion, Site, Magic, Aura, Artifact, Avatar)
 * possua suas próprias configurações de layout, coordenadas, dimensões,
 * caixas de texto, fontes, indicadores e ilustrações 100% isoladas.
 */

import {
  CardTypeState,
  CardDimensionsConfig,
  CARD_PRESETS,
  SORCERY_CARD_DIMENSIONS,
  getCardDimensionsForType,
  CardArtConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  TextBoxConfig,
  CardTypeId,
} from '../types/card';
import {
  DEFAULT_CARD_ART,
  DEFAULT_CARD_FRAME,
  DEFAULT_CARD_SYMBOLS,
  getDefaultTextBoxesForType,
} from './cardDefaults';
import {
  SorceryIndicatorsConfig,
  getDefaultSorceryConfigForType,
  createNewCardSorceryConfig,
  getStoredSorceryConfig,
  resetVisualsToPermanentDefaults,
} from '../types/sorcery';
import {
  CardAttributeId,
  findAttributeByFrameUrl,
  getFrameUrlForAttribute,
} from '../types/cardAttribute';
import {
  getSiteOfficialDefaultLayout,
  saveSiteOfficialDefaultLayout,
  applySiteOfficialLayoutToTextBoxes,
  applySiteOfficialLayoutToSorcery,
} from './siteDefaults';

export type { CardTypeState };


const CARD_STATE_STORAGE_PREFIX = 'cardforge_card_state_';

export const ALL_CARD_TYPE_IDS: CardTypeId[] = [
  'minion',
  'site',
  'magic',
  'aura',
  'artifact',
  'avatar',
];

/**
 * Sessão em memória do editor ativo.
 * Permanece 100% íntegra enquanto o aplicativo continuar aberto,
 * mesmo ao trocar de aba, minimizar ou quando ocorrem eventos de blur/visibilitychange.
 */
interface SessionCache {
  activeCardType: CardTypeId | null;
  lastActiveCardType: CardTypeId;
  hasStartedEditing: boolean;
  selectionStep: 'type' | 'attribute';
  pendingCardType: CardTypeId | null;
  cardStates: Record<CardTypeId, CardTypeState> | null;
}

const memorySession: SessionCache = {
  activeCardType: null,
  lastActiveCardType: 'minion',
  hasStartedEditing: false,
  selectionStep: 'type',
  pendingCardType: null,
  cardStates: null,
};

const SESSION_STORAGE_ACTIVE_TYPE_KEY = 'cardforge_session_active_type';
const SESSION_STORAGE_HAS_STARTED_KEY = 'cardforge_session_has_started';
const SESSION_STORAGE_LAST_TYPE_KEY = 'cardforge_session_last_type';
const SESSION_STORAGE_STEP_KEY = 'cardforge_session_selection_step';
const SESSION_STORAGE_PENDING_TYPE_KEY = 'cardforge_session_pending_type';

export function getSessionActiveCardType(): CardTypeId | null {
  if (memorySession.activeCardType !== null) return memorySession.activeCardType;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_ACTIVE_TYPE_KEY);
    if (raw && ALL_CARD_TYPE_IDS.includes(raw as CardTypeId)) {
      memorySession.activeCardType = raw as CardTypeId;
      return memorySession.activeCardType;
    }
  } catch {}
  return null;
}

export function setSessionActiveCardType(type: CardTypeId | null): void {
  memorySession.activeCardType = type;
  try {
    if (type) {
      sessionStorage.setItem(SESSION_STORAGE_ACTIVE_TYPE_KEY, type);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_ACTIVE_TYPE_KEY);
    }
  } catch {}
}

export function getSessionHasStartedEditing(): boolean {
  if (memorySession.hasStartedEditing) return true;
  try {
    return sessionStorage.getItem(SESSION_STORAGE_HAS_STARTED_KEY) === 'true';
  } catch {}
  return false;
}

export function setSessionHasStartedEditing(started: boolean): void {
  memorySession.hasStartedEditing = started;
  try {
    sessionStorage.setItem(SESSION_STORAGE_HAS_STARTED_KEY, started ? 'true' : 'false');
  } catch {}
}

export function getSessionLastActiveCardType(): CardTypeId {
  if (memorySession.lastActiveCardType) return memorySession.lastActiveCardType;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_LAST_TYPE_KEY);
    if (raw && ALL_CARD_TYPE_IDS.includes(raw as CardTypeId)) {
      memorySession.lastActiveCardType = raw as CardTypeId;
      return memorySession.lastActiveCardType;
    }
  } catch {}
  return 'minion';
}

export function setSessionLastActiveCardType(type: CardTypeId): void {
  memorySession.lastActiveCardType = type;
  try {
    sessionStorage.setItem(SESSION_STORAGE_LAST_TYPE_KEY, type);
  } catch {}
}

export function getSessionSelectionStep(): 'type' | 'attribute' {
  if (memorySession.selectionStep) return memorySession.selectionStep;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_STEP_KEY);
    if (raw === 'type' || raw === 'attribute') {
      memorySession.selectionStep = raw;
      return raw;
    }
  } catch {}
  return 'type';
}

export function setSessionSelectionStep(step: 'type' | 'attribute'): void {
  memorySession.selectionStep = step;
  try {
    sessionStorage.setItem(SESSION_STORAGE_STEP_KEY, step);
  } catch {}
}

export function getSessionPendingCardType(): CardTypeId | null {
  if (memorySession.pendingCardType !== null) return memorySession.pendingCardType;
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_PENDING_TYPE_KEY);
    if (raw && ALL_CARD_TYPE_IDS.includes(raw as CardTypeId)) {
      memorySession.pendingCardType = raw as CardTypeId;
      return memorySession.pendingCardType;
    }
  } catch {}
  return null;
}

export function setSessionPendingCardType(type: CardTypeId | null): void {
  memorySession.pendingCardType = type;
  try {
    if (type) {
      sessionStorage.setItem(SESSION_STORAGE_PENDING_TYPE_KEY, type);
    } else {
      sessionStorage.removeItem(SESSION_STORAGE_PENDING_TYPE_KEY);
    }
  } catch {}
}

export function persistCurrentSessionInMemory(): void {
  if (typeof window !== 'undefined') {
    (window as any).__cardforge_session = memorySession;
  }
}

/**
 * Cria a configuração padrão inicial independente para um tipo específico de carta.
 * Para Site: adota proporção horizontal 88 × 63 mm.
 * Para os demais: adota proporção 63 × 88 mm.
 */
export function getDefaultCardTypeState(cardType: CardTypeId): CardTypeState {
  const dimensions: CardDimensionsConfig = { ...getCardDimensionsForType(cardType) };

  const artConfig: CardArtConfig = {
    ...DEFAULT_CARD_ART,
    imageUrl: null,
  };

  const frameConfig: CardFrameConfig = {
    ...DEFAULT_CARD_FRAME,
    imageUrl: null,
  };

  const symbolsConfig: CardSymbolsConfig = JSON.parse(JSON.stringify(DEFAULT_CARD_SYMBOLS));
  let textBoxes: TextBoxConfig[] = getDefaultTextBoxesForType(cardType);
  let sorceryConfig: SorceryIndicatorsConfig = getDefaultSorceryConfigForType(cardType);

  if (cardType === 'site') {
    const siteOfficial = getSiteOfficialDefaultLayout();
    textBoxes = applySiteOfficialLayoutToTextBoxes(textBoxes, siteOfficial, true);
    sorceryConfig = applySiteOfficialLayoutToSorcery(sorceryConfig, siteOfficial, true);
  }

  return {
    cardType,
    dimensions,
    artConfig,
    frameConfig,
    symbolsConfig,
    textBoxes,
    sorceryConfig,
  };
}

/**
 * Recupera o estado de um tipo de carta.
 * Prioridade 1: Retorna a instância em memória da sessão atual se já existir,
 * garantindo que retornar de outra aba ou focar a janela nunca sobrescreva ou reverta edições.
 */
export function getStoredCardTypeState(cardType: CardTypeId): CardTypeState {
  if (memorySession.cardStates && memorySession.cardStates[cardType]) {
    return memorySession.cardStates[cardType];
  }

  const storageKey = `${CARD_STATE_STORAGE_PREFIX}${cardType}`;

  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const defaultState = getDefaultCardTypeState(cardType);
      const attributeFromFrame = parsed.frameConfig?.imageUrl
        ? findAttributeByFrameUrl(parsed.frameConfig.imageUrl, cardType)?.id
        : undefined;

      // Normalização dimensional rigorosa:
      // Site: 88 × 63 mm (horizontal, aspectRatio ~1.3968)
      // Demais cartas: 63 × 88 mm (vertical, aspectRatio ~0.7159)
      const targetDims = getCardDimensionsForType(cardType);
      const isSite = cardType === 'site';
      const expectedRatio = isSite ? 88 / 63 : 63 / 88;
      const storedDims = parsed.dimensions;
      const isLegacyRatio = !storedDims || Math.abs(storedDims.aspectRatio - expectedRatio) > 0.05;
      const dimensions: CardDimensionsConfig = isLegacyRatio
        ? { ...targetDims }
        : {
            ...storedDims,
            widthMm: targetDims.widthMm,
            heightMm: targetDims.heightMm,
            aspectRatio: expectedRatio,
            borderRadiusPx: Math.max(18, storedDims.borderRadiusPx || 18),
          };

      const restoredState: CardTypeState = {
        cardType,
        selectedAttribute: parsed.selectedAttribute || attributeFromFrame,
        dimensions,
        artConfig: {
          ...defaultState.artConfig,
          ...(parsed.artConfig || {}),
        },
        frameConfig: {
          ...defaultState.frameConfig,
          ...(parsed.frameConfig || {}),
        },
        symbolsConfig: parsed.symbolsConfig || defaultState.symbolsConfig,
        textBoxes: Array.isArray(parsed.textBoxes) && parsed.textBoxes.length > 0
          ? parsed.textBoxes.map((box: TextBoxConfig) => {
              const isTitleOrType =
                box.role === 'title' ||
                box.role === 'type' ||
                box.id === 'box-title' ||
                box.id === 'box-type';
              let updatedBox = box;
              if (isTitleOrType && (box.fontFamily === 'morpheus' || box.fontFamily === 'palatino-italic' || !box.fontFamily)) {
                updatedBox = { ...updatedBox, fontFamily: 'fantaisie-artistique' };
              }
              if (isTitleOrType && (box.textStrokeWidthPx === 2.5 || box.textStrokeWidthPx === undefined)) {
                updatedBox = { ...updatedBox, textStrokeWidthPx: 0.8 };
              }
              return updatedBox;
            })
          : defaultState.textBoxes,
        sorceryConfig: (() => {
          const cfg = parsed.sorceryConfig || defaultState.sorceryConfig;
          const defaultThreshold = defaultState.sorceryConfig?.threshold;
          if (cfg?.threshold) {
            const mergedElementImages = {
              ...(defaultThreshold?.elementImages || {}),
              ...(cfg.threshold.elementImages || {}),
              espirito: cfg.threshold.elementImages?.espirito || '/assets/sorcery/Espirito.png',
              materia: cfg.threshold.elementImages?.materia || '/assets/sorcery/Matéria.png',
              vazio: cfg.threshold.elementImages?.vazio || '/assets/sorcery/Vazio.png',
              vida: cfg.threshold.elementImages?.vida || '/assets/sorcery/Vida.png',
              morte: cfg.threshold.elementImages?.morte || '/assets/sorcery/Morte.png',
            };

            const existingOrder = Array.isArray(cfg.threshold.elementOrder) && cfg.threshold.elementOrder.length > 0
              ? cfg.threshold.elementOrder
              : ['air', 'earth', 'fire', 'water'];
            const allElements: import('../types/sorcery').SorceryElement[] = [
              'air',
              'earth',
              'fire',
              'water',
              'espirito',
              'materia',
              'vazio',
              'vida',
              'morte',
            ];
            const mergedOrder = [
              ...existingOrder,
              ...allElements.filter((e) => !existingOrder.includes(e)),
            ];

            const updatedThreshold = {
              ...cfg.threshold,
              espirito: cfg.threshold.espirito ?? 0,
              materia: cfg.threshold.materia ?? 0,
              vazio: cfg.threshold.vazio ?? 0,
              vida: cfg.threshold.vida ?? 0,
              morte: cfg.threshold.morte ?? 0,
              elementImages: mergedElementImages,
              elementOrder: mergedOrder,
            };

            if (cardType !== 'site') {
              updatedThreshold.yPercent =
                cfg.threshold.yPercent === 5.3 ||
                cfg.threshold.yPercent === 5.7 ||
                cfg.threshold.yPercent === undefined
                  ? defaultState.sorceryConfig.threshold.yPercent
                  : cfg.threshold.yPercent;
            }

            return {
              ...cfg,
              threshold: updatedThreshold,
            };
          }
          return cfg;
        })(),
      };

      if (!memorySession.cardStates) {
        memorySession.cardStates = {} as Record<CardTypeId, CardTypeState>;
      }
      memorySession.cardStates[cardType] = restoredState;

      // Se for Site, consolida as configurações como padrão oficial se ainda não tiverem sido salvas
      if (cardType === 'site') {
        saveSiteOfficialDefaultLayout({
          textBoxes: restoredState.textBoxes,
          sorceryConfig: restoredState.sorceryConfig,
        });
      }

      return restoredState;
    }
  } catch (err) {
    console.warn(`Erro ao carregar estado da carta ${cardType}:`, err);
  }

  // Fallback inicial seguro
  const fresh = getDefaultCardTypeState(cardType);
  try {
    const legacySorcery = getStoredSorceryConfig(cardType);
    if (legacySorcery) {
      fresh.sorceryConfig = legacySorcery;
    }
  } catch {}

  if (!memorySession.cardStates) {
    memorySession.cardStates = {} as Record<CardTypeId, CardTypeState>;
  }
  memorySession.cardStates[cardType] = fresh;
  saveStoredCardTypeState(cardType, fresh);
  return fresh;
}

/**
 * Salva o estado independente do tipo de carta na memória da sessão e no armazenamento.
 */
export function saveStoredCardTypeState(cardType: CardTypeId, state: CardTypeState): void {
  if (!memorySession.cardStates) {
    memorySession.cardStates = {} as Record<CardTypeId, CardTypeState>;
  }
  memorySession.cardStates[cardType] = state;
  persistCurrentSessionInMemory();

  if (cardType === 'site') {
    // Sincroniza automaticamente o layout oficial do Site preservando as configurações visuais
    saveSiteOfficialDefaultLayout({
      textBoxes: state.textBoxes,
      sorceryConfig: state.sorceryConfig,
    });
  }

  const storageKey = `${CARD_STATE_STORAGE_PREFIX}${cardType}`;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (err) {
    // Se estourar a cota de localStorage por imagem pesada em base64, salva os dados textuais/atributos
    try {
      const lightweight = {
        ...state,
        artConfig: {
          ...state.artConfig,
          imageUrl: state.artConfig.imageUrl?.startsWith('data:') ? null : state.artConfig.imageUrl,
        },
      };
      localStorage.setItem(storageKey, JSON.stringify(lightweight));
    } catch {}
  }
}

/**
 * Restaura todas as configurações visuais de um tipo de carta para os valores padrão permanentes,
 * com opção de preservar os dados da carta (textos digitados, imagem enviada, valores numéricos).
 */
export function resetVisualsToDefaultCardState(
  cardType: CardTypeId,
  current?: CardTypeState,
  keepContent: boolean = true
): CardTypeState {
  const defaultBase = getDefaultCardTypeState(cardType);
  if (!keepContent || !current) {
    saveStoredCardTypeState(cardType, defaultBase);
    return defaultBase;
  }

  const restoredArt: CardArtConfig = {
    ...defaultBase.artConfig,
    imageUrl: current.artConfig.imageUrl,
  };

  const restoredFrame: CardFrameConfig = {
    ...defaultBase.frameConfig,
    imageUrl: current.frameConfig.imageUrl,
  };

  const restoredTextBoxes: TextBoxConfig[] = defaultBase.textBoxes.map((defBox) => {
    const match = current.textBoxes.find((b) => b.id === defBox.id || b.role === defBox.role);
    return match ? { ...defBox, content: match.content, isVisible: match.isVisible } : defBox;
  });

  const restoredSorcery: SorceryIndicatorsConfig = resetVisualsToPermanentDefaults(
    true,
    current.sorceryConfig,
    cardType
  );

  const restored: CardTypeState = {
    cardType,
    selectedAttribute: current.selectedAttribute,
    dimensions: { ...defaultBase.dimensions },
    artConfig: restoredArt,
    frameConfig: restoredFrame,
    symbolsConfig: JSON.parse(JSON.stringify(defaultBase.symbolsConfig)),
    textBoxes: restoredTextBoxes,
    sorceryConfig: restoredSorcery,
  };

  saveStoredCardTypeState(cardType, restored);
  return restored;
}

/**
 * Carrega todos os tipos de cartas existentes em um dicionário Record<CardTypeId, CardTypeState>.
 * Executado na inicialização da aplicação para disponibilizar acesso imediato e síncrono.
 */
export function loadAllCardTypeStates(): Record<CardTypeId, CardTypeState> {
  if (memorySession.cardStates) {
    return { ...memorySession.cardStates };
  }
  const record = {} as Record<CardTypeId, CardTypeState>;
  for (const typeId of ALL_CARD_TYPE_IDS) {
    record[typeId] = getStoredCardTypeState(typeId);
  }
  memorySession.cardStates = record;
  return record;
}

/**
 * Ação "Nova Carta": limpa os dados de conteúdo da carta (imagens, textos e números),
 * mas preserva 100% das configurações visuais (posicionamento das caixas, fontes, cores,
 * alinhamentos, bordas, dimensões e proporções) exclusivamente para o tipo ativo.
 * Se um newAttribute for especificado, aplica automaticamente a moldura permanente daquele atributo.
 */
export function createNewCardState(
  cardType: CardTypeId,
  currentVisuals?: CardTypeState,
  newAttribute?: CardAttributeId
): CardTypeState {
  const base = currentVisuals || getStoredCardTypeState(cardType);
  const defaultBase = getDefaultCardTypeState(cardType);

  // 1. Limpa arte preservando configurações de enquadramento
  const cleanArt: CardArtConfig = {
    ...base.artConfig,
    imageUrl: null,
  };

  // 2. Limpa valores de mana, threshold e combate preservando posições e estilos
  let cleanSorcery: SorceryIndicatorsConfig = createNewCardSorceryConfig(
    base.sorceryConfig,
    cardType
  );

  // 3. Limpa conteúdo das caixas de texto preservando todas as posições, dimensões, fontes e espaçamentos
  let cleanTextBoxes: TextBoxConfig[] = base.textBoxes.map((box) => {
    const defaultBox = defaultBase.textBoxes.find((b) => b.id === box.id || b.role === box.role);
    const isTitleOrType =
      box.role === 'title' ||
      box.role === 'type' ||
      box.id === 'box-title' ||
      box.id === 'box-type';
    return {
      ...box,
      content: defaultBox ? defaultBox.content : '',
      fontFamily: isTitleOrType && (box.fontFamily === 'morpheus' || box.fontFamily === 'palatino-italic' || !box.fontFamily)
        ? 'fantaisie-artistique'
        : box.fontFamily,
      textStrokeWidthPx:
        isTitleOrType && (box.textStrokeWidthPx === 2.5 || box.textStrokeWidthPx === undefined)
          ? 0.8
          : box.textStrokeWidthPx,
    };
  });

  // Exclusivo para o tipo Site: novas cartas iniciam rigorosamente no padrão oficial permanente
  if (cardType === 'site') {
    const siteOfficial = getSiteOfficialDefaultLayout();
    cleanSorcery = applySiteOfficialLayoutToSorcery(cleanSorcery, siteOfficial, false);
    cleanTextBoxes = applySiteOfficialLayoutToTextBoxes(cleanTextBoxes, siteOfficial, false);
  }

  // 4. Configuração de moldura: se novo atributo informado, carrega a respectiva moldura PNG
  const targetAttribute = newAttribute !== undefined ? newAttribute : base.selectedAttribute;
  const frameConfig: CardFrameConfig = newAttribute
    ? {
        ...base.frameConfig,
        imageUrl: getFrameUrlForAttribute(newAttribute, cardType),
        opacity: 1,
        fit: 'fill',
        isVisible: true,
      }
    : { ...base.frameConfig };

  return {
    cardType,
    selectedAttribute: targetAttribute,
    dimensions: {
      ...(base.dimensions && (cardType === 'site' ? base.dimensions.widthMm === 88 : base.dimensions.widthMm === 63)
        ? base.dimensions
        : getCardDimensionsForType(cardType)),
    },
    artConfig: cleanArt,
    frameConfig,
    symbolsConfig: JSON.parse(JSON.stringify(base.symbolsConfig)),
    textBoxes: cleanTextBoxes,
    sorceryConfig: cleanSorcery,
  };
}

