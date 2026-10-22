/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Gerenciador de Padrões Oficiais Exclusivos para Cartas do Tipo Site
 * =========================================================================
 * REGRA ABSOLUTA: Este módulo afeta EXCLUSIVAMENTE o tipo de carta Site.
 * Demais tipos (Minion, Magic, Aura, Artifact, Avatar) permanecem 100% intactos.
 * 
 * Hierarquia de Persistência:
 * 1. Configuração personalizada da carta salva (se a carta já existe)
 * 2. Layout padrão atual do Site (armazenado em localStorage e capturado do editor)
 * 3. Fallback de constantes de código
 */

import { TextBoxConfig, FontFamilyType } from '../types/card';
import { SorceryThresholdConfig, SorceryCombatConfig, SorceryIndicatorsConfig } from '../types/sorcery';
import { DEFAULT_SITE_TEXT_BOXES } from './cardDefaults';
import { SITE_DEFAULT_THRESHOLD_CONFIG, SITE_DEFAULT_COMBAT_CONFIG } from '../types/sorcery';

export const SITE_OFFICIAL_DEFAULT_STORAGE_KEY = 'cardforge_site_official_defaults_v1';
export const SITE_CARD_STATE_STORAGE_KEY = 'cardforge_card_state_site';

export interface SiteCompositeTitleLayout {
  // Container & Segmento 1 (Nome da Carta)
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent?: number;
  fontSizePx: number;
  fontFamily: FontFamilyType;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  bgColor: string;
  borderColor: string;
  borderWidthPx: number;
  borderRadiusPx: number;
  paddingPx?: number;
  paddingXPx?: number;
  paddingYPx?: number;
  letterSpacingPx?: number;
  wordSpacingPx?: number;
  lineHeight?: number;
  textStrokeEnabled?: boolean;
  textStrokeWidthPx?: number;
  textStrokeColor?: string;

  // Segmento 2 (Tipo / Subtipo)
  typeFontSizePx: number;
  typeFontFamily: FontFamilyType;
  typeFontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  typeTextColor: string;
  typeLetterSpacingPx?: number;
  typeTextStrokeEnabled?: boolean;
  typeTextStrokeWidthPx?: number;
  typeTextStrokeColor?: string;
}

export interface SiteOfficialLayout {
  threshold: Pick<
    SorceryThresholdConfig,
    | 'xPercent'
    | 'yPercent'
    | 'symbolWidthPercent'
    | 'symbolHeightPercent'
    | 'scale'
    | 'gapXPercent'
    | 'gapYPercent'
    | 'opacity'
    | 'zIndex'
  >;
  compositeTitle: SiteCompositeTitleLayout;
  combat: {
    siteCombatOption: 'attack-only' | 'attack-defense' | 'none';
    selectedType: 'attack-only' | 'attack-defense';
    single: {
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
      scale: number;
      attackXPercent: number;
      attackYPercent: number;
    };
    dual: {
      xPercent: number;
      yPercent: number;
      widthPercent: number;
      heightPercent: number;
      scale: number;
      attackXPercent: number;
      attackYPercent: number;
      defenseXPercent: number;
      defenseYPercent: number;
    };
  };
}

/**
 * Extrai o layout padrão oficial do Site baseado nas constantes iniciais do código.
 */
export function getSiteCodeBaseLayout(): SiteOfficialLayout {
  const titleBox = DEFAULT_SITE_TEXT_BOXES.find((b) => b.id === 'box-title' || b.role === 'title') || DEFAULT_SITE_TEXT_BOXES[0];
  const typeBox = DEFAULT_SITE_TEXT_BOXES.find((b) => b.id === 'box-type' || b.role === 'type') || DEFAULT_SITE_TEXT_BOXES[1];

  return {
    threshold: {
      xPercent: SITE_DEFAULT_THRESHOLD_CONFIG.xPercent,
      yPercent: SITE_DEFAULT_THRESHOLD_CONFIG.yPercent,
      symbolWidthPercent: SITE_DEFAULT_THRESHOLD_CONFIG.symbolWidthPercent,
      symbolHeightPercent: SITE_DEFAULT_THRESHOLD_CONFIG.symbolHeightPercent,
      scale: SITE_DEFAULT_THRESHOLD_CONFIG.scale || 0.85,
      gapXPercent: SITE_DEFAULT_THRESHOLD_CONFIG.gapXPercent,
      gapYPercent: SITE_DEFAULT_THRESHOLD_CONFIG.gapYPercent,
      opacity: SITE_DEFAULT_THRESHOLD_CONFIG.opacity ?? 1.0,
      zIndex: SITE_DEFAULT_THRESHOLD_CONFIG.zIndex || 60,
    },
    compositeTitle: {
      xPercent: titleBox.xPercent,
      yPercent: titleBox.yPercent,
      widthPercent: titleBox.widthPercent,
      heightPercent: titleBox.heightPercent,
      fontSizePx: titleBox.fontSizePx,
      fontFamily: titleBox.fontFamily,
      fontWeight: titleBox.fontWeight,
      textAlign: titleBox.textAlign,
      textColor: titleBox.textColor,
      bgColor: titleBox.bgColor,
      borderColor: titleBox.borderColor,
      borderWidthPx: titleBox.borderWidthPx,
      borderRadiusPx: titleBox.borderRadiusPx,
      paddingPx: titleBox.paddingPx,
      paddingXPx: titleBox.paddingXPx,
      paddingYPx: titleBox.paddingYPx,
      letterSpacingPx: titleBox.letterSpacingPx,
      wordSpacingPx: titleBox.wordSpacingPx,
      lineHeight: titleBox.lineHeight,
      textStrokeEnabled: titleBox.textStrokeEnabled,
      textStrokeWidthPx: titleBox.textStrokeWidthPx,
      textStrokeColor: titleBox.textStrokeColor,

      typeFontSizePx: typeBox.fontSizePx,
      typeFontFamily: typeBox.fontFamily,
      typeFontWeight: typeBox.fontWeight,
      typeTextColor: typeBox.textColor,
      typeLetterSpacingPx: typeBox.letterSpacingPx,
      typeTextStrokeEnabled: typeBox.textStrokeEnabled,
      typeTextStrokeWidthPx: typeBox.textStrokeWidthPx,
      typeTextStrokeColor: typeBox.textStrokeColor,
    },
    combat: {
      siteCombatOption: (SITE_DEFAULT_COMBAT_CONFIG.siteCombatOption as any) || 'attack-only',
      selectedType: SITE_DEFAULT_COMBAT_CONFIG.selectedType || 'attack-only',
      single: {
        xPercent: SITE_DEFAULT_COMBAT_CONFIG.single.xPercent,
        yPercent: SITE_DEFAULT_COMBAT_CONFIG.single.yPercent,
        widthPercent: SITE_DEFAULT_COMBAT_CONFIG.single.widthPercent,
        heightPercent: SITE_DEFAULT_COMBAT_CONFIG.single.heightPercent,
        scale: SITE_DEFAULT_COMBAT_CONFIG.single.scale,
        attackXPercent: SITE_DEFAULT_COMBAT_CONFIG.single.attackXPercent,
        attackYPercent: SITE_DEFAULT_COMBAT_CONFIG.single.attackYPercent,
      },
      dual: {
        xPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.xPercent,
        yPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.yPercent,
        widthPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.widthPercent,
        heightPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.heightPercent,
        scale: SITE_DEFAULT_COMBAT_CONFIG.dual.scale,
        attackXPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.attackXPercent,
        attackYPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.attackYPercent,
        defenseXPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.defenseXPercent,
        defenseYPercent: SITE_DEFAULT_COMBAT_CONFIG.dual.defenseYPercent,
      },
    },
  };
}

/**
 * Obtém o layout padrão oficial para cartas Site seguindo a hierarquia estrita:
 * 1. Chave persistente oficial (SITE_OFFICIAL_DEFAULT_STORAGE_KEY)
 * 2. Captura automática do estado atual configurado pelo usuário em SITE_CARD_STATE_STORAGE_KEY
 * 3. Fallback de código
 */
export function getSiteOfficialDefaultLayout(): SiteOfficialLayout {
  const fallback = getSiteCodeBaseLayout();

  if (typeof window === 'undefined' || !window.localStorage) {
    return fallback;
  }

  try {
    // 1. Tenta carregar a chave oficial explícita
    const rawOfficial = localStorage.getItem(SITE_OFFICIAL_DEFAULT_STORAGE_KEY);
    if (rawOfficial) {
      const parsed = JSON.parse(rawOfficial);
      if (parsed && parsed.threshold && parsed.compositeTitle) {
        return {
          threshold: { ...fallback.threshold, ...parsed.threshold },
          compositeTitle: { ...fallback.compositeTitle, ...parsed.compositeTitle },
          combat: { ...fallback.combat, ...(parsed.combat || {}) },
        };
      }
    }

    // 2. Tenta capturar do estado atual da carta Site configurada pelo usuário
    const rawSiteState = localStorage.getItem(SITE_CARD_STATE_STORAGE_KEY);
    if (rawSiteState) {
      const siteState = JSON.parse(rawSiteState);
      const boxes: TextBoxConfig[] = siteState.textBoxes || [];
      const titleBox = boxes.find((b) => b.id === 'box-title' || b.role === 'title');
      const typeBox = boxes.find((b) => b.id === 'box-type' || b.role === 'type');
      const thresh: SorceryThresholdConfig | undefined = siteState.sorceryConfig?.threshold;
      const combat: SorceryCombatConfig | undefined = siteState.sorceryConfig?.combat;

      if (titleBox || thresh) {
        const captured: SiteOfficialLayout = {
          threshold: thresh
            ? {
                xPercent: typeof thresh.xPercent === 'number' ? thresh.xPercent : fallback.threshold.xPercent,
                yPercent: typeof thresh.yPercent === 'number' ? thresh.yPercent : fallback.threshold.yPercent,
                symbolWidthPercent: thresh.symbolWidthPercent || fallback.threshold.symbolWidthPercent,
                symbolHeightPercent: thresh.symbolHeightPercent || fallback.threshold.symbolHeightPercent,
                scale: thresh.scale || fallback.threshold.scale,
                gapXPercent: typeof thresh.gapXPercent === 'number' ? thresh.gapXPercent : fallback.threshold.gapXPercent,
                gapYPercent: typeof thresh.gapYPercent === 'number' ? thresh.gapYPercent : fallback.threshold.gapYPercent,
                opacity: thresh.opacity ?? fallback.threshold.opacity,
                zIndex: thresh.zIndex || fallback.threshold.zIndex,
              }
            : fallback.threshold,
          compositeTitle: titleBox
            ? {
                xPercent: titleBox.xPercent,
                yPercent: titleBox.yPercent,
                widthPercent: titleBox.widthPercent,
                heightPercent: titleBox.heightPercent,
                fontSizePx: titleBox.fontSizePx,
                fontFamily: titleBox.fontFamily,
                fontWeight: titleBox.fontWeight,
                textAlign: titleBox.textAlign,
                textColor: titleBox.textColor,
                bgColor: titleBox.bgColor,
                borderColor: titleBox.borderColor,
                borderWidthPx: titleBox.borderWidthPx,
                borderRadiusPx: titleBox.borderRadiusPx,
                paddingPx: titleBox.paddingPx,
                paddingXPx: titleBox.paddingXPx,
                paddingYPx: titleBox.paddingYPx,
                letterSpacingPx: titleBox.letterSpacingPx,
                wordSpacingPx: titleBox.wordSpacingPx,
                lineHeight: titleBox.lineHeight,
                textStrokeEnabled: titleBox.textStrokeEnabled,
                textStrokeWidthPx: titleBox.textStrokeWidthPx,
                textStrokeColor: titleBox.textStrokeColor,

                typeFontSizePx: typeBox?.fontSizePx || fallback.compositeTitle.typeFontSizePx,
                typeFontFamily: typeBox?.fontFamily || fallback.compositeTitle.typeFontFamily,
                typeFontWeight: typeBox?.fontWeight || fallback.compositeTitle.typeFontWeight,
                typeTextColor: typeBox?.textColor || fallback.compositeTitle.typeTextColor,
                typeLetterSpacingPx: typeBox?.letterSpacingPx ?? fallback.compositeTitle.typeLetterSpacingPx,
                typeTextStrokeEnabled: typeBox?.textStrokeEnabled ?? fallback.compositeTitle.typeTextStrokeEnabled,
                typeTextStrokeWidthPx: typeBox?.textStrokeWidthPx ?? fallback.compositeTitle.typeTextStrokeWidthPx,
                typeTextStrokeColor: typeBox?.textStrokeColor ?? fallback.compositeTitle.typeTextStrokeColor,
              }
            : fallback.compositeTitle,
          combat: combat
            ? {
                siteCombatOption: combat.siteCombatOption || fallback.combat.siteCombatOption,
                selectedType: combat.selectedType || fallback.combat.selectedType,
                single: { ...fallback.combat.single, ...(combat.single || {}) },
                dual: { ...fallback.combat.dual, ...(combat.dual || {}) },
              }
            : fallback.combat,
        };

        // Salva na chave oficial para consolidar permanentemente
        try {
          localStorage.setItem(SITE_OFFICIAL_DEFAULT_STORAGE_KEY, JSON.stringify(captured));
        } catch {}

        return captured;
      }
    }
  } catch (e) {
    console.warn('Erro ao carregar layout oficial do Site:', e);
  }

  return fallback;
}

/**
 * Salva explicitamente o layout atual configurado para Site como o novo padrão permanente oficial.
 */
export function saveSiteOfficialDefaultLayout(params: {
  textBoxes: TextBoxConfig[];
  sorceryConfig: SorceryIndicatorsConfig;
}): SiteOfficialLayout {
  const current = getSiteOfficialDefaultLayout();
  const titleBox = params.textBoxes.find((b) => b.id === 'box-title' || b.role === 'title');
  const typeBox = params.textBoxes.find((b) => b.id === 'box-type' || b.role === 'type');
  const thresh = params.sorceryConfig.threshold;
  const combat = params.sorceryConfig.combat;

  const updated: SiteOfficialLayout = {
    threshold: {
      xPercent: thresh.xPercent,
      yPercent: thresh.yPercent,
      symbolWidthPercent: thresh.symbolWidthPercent,
      symbolHeightPercent: thresh.symbolHeightPercent,
      scale: thresh.scale || 0.85,
      gapXPercent: thresh.gapXPercent,
      gapYPercent: thresh.gapYPercent,
      opacity: thresh.opacity ?? 1.0,
      zIndex: thresh.zIndex || 60,
    },
    compositeTitle: titleBox
      ? {
          xPercent: titleBox.xPercent,
          yPercent: titleBox.yPercent,
          widthPercent: titleBox.widthPercent,
          heightPercent: titleBox.heightPercent,
          fontSizePx: titleBox.fontSizePx,
          fontFamily: titleBox.fontFamily,
          fontWeight: titleBox.fontWeight,
          textAlign: titleBox.textAlign,
          textColor: titleBox.textColor,
          bgColor: titleBox.bgColor,
          borderColor: titleBox.borderColor,
          borderWidthPx: titleBox.borderWidthPx,
          borderRadiusPx: titleBox.borderRadiusPx,
          paddingPx: titleBox.paddingPx,
          paddingXPx: titleBox.paddingXPx,
          paddingYPx: titleBox.paddingYPx,
          letterSpacingPx: titleBox.letterSpacingPx,
          wordSpacingPx: titleBox.wordSpacingPx,
          lineHeight: titleBox.lineHeight,
          textStrokeEnabled: titleBox.textStrokeEnabled,
          textStrokeWidthPx: titleBox.textStrokeWidthPx,
          textStrokeColor: titleBox.textStrokeColor,

          typeFontSizePx: typeBox?.fontSizePx || current.compositeTitle.typeFontSizePx,
          typeFontFamily: typeBox?.fontFamily || current.compositeTitle.typeFontFamily,
          typeFontWeight: typeBox?.fontWeight || current.compositeTitle.typeFontWeight,
          typeTextColor: typeBox?.textColor || current.compositeTitle.typeTextColor,
          typeLetterSpacingPx: typeBox?.letterSpacingPx ?? current.compositeTitle.typeLetterSpacingPx,
          typeTextStrokeEnabled: typeBox?.textStrokeEnabled ?? current.compositeTitle.typeTextStrokeEnabled,
          typeTextStrokeWidthPx: typeBox?.textStrokeWidthPx ?? current.compositeTitle.typeTextStrokeWidthPx,
          typeTextStrokeColor: typeBox?.textStrokeColor ?? current.compositeTitle.typeTextStrokeColor,
        }
      : current.compositeTitle,
    combat: {
      siteCombatOption: combat.siteCombatOption || current.combat.siteCombatOption,
      selectedType: combat.selectedType || current.combat.selectedType,
      single: {
        xPercent: combat.single?.xPercent ?? current.combat.single.xPercent,
        yPercent: combat.single?.yPercent ?? current.combat.single.yPercent,
        widthPercent: combat.single?.widthPercent ?? current.combat.single.widthPercent,
        heightPercent: combat.single?.heightPercent ?? current.combat.single.heightPercent,
        scale: combat.single?.scale ?? current.combat.single.scale,
        attackXPercent: combat.single?.attackXPercent ?? current.combat.single.attackXPercent,
        attackYPercent: combat.single?.attackYPercent ?? current.combat.single.attackYPercent,
      },
      dual: {
        xPercent: combat.dual?.xPercent ?? current.combat.dual.xPercent,
        yPercent: combat.dual?.yPercent ?? current.combat.dual.yPercent,
        widthPercent: combat.dual?.widthPercent ?? current.combat.dual.widthPercent,
        heightPercent: combat.dual?.heightPercent ?? current.combat.dual.heightPercent,
        scale: combat.dual?.scale ?? current.combat.dual.scale,
        attackXPercent: combat.dual?.attackXPercent ?? current.combat.dual.attackXPercent,
        attackYPercent: combat.dual?.attackYPercent ?? current.combat.dual.attackYPercent,
        defenseXPercent: combat.dual?.defenseXPercent ?? current.combat.dual.defenseXPercent,
        defenseYPercent: combat.dual?.defenseYPercent ?? current.combat.dual.defenseYPercent,
      },
    },
  };

  try {
    localStorage.setItem(SITE_OFFICIAL_DEFAULT_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Erro ao salvar layout oficial do Site no localStorage:', e);
  }

  return updated;
}

/**
 * Aplica o layout oficial do Site a uma lista de caixas de texto preservando ou redefinindo o conteúdo.
 */
export function applySiteOfficialLayoutToTextBoxes(
  boxes: TextBoxConfig[],
  official: SiteOfficialLayout,
  keepContent: boolean = true
): TextBoxConfig[] {
  return boxes.map((box) => {
    if (box.id === 'box-title' || box.role === 'title') {
      const c = official.compositeTitle;
      return {
        ...box,
        content: keepContent ? box.content : 'Ruínas Ancestrais de Sorcery',
        xPercent: c.xPercent,
        yPercent: c.yPercent,
        widthPercent: c.widthPercent,
        heightPercent: c.heightPercent,
        fontSizePx: c.fontSizePx,
        fontFamily: c.fontFamily,
        fontWeight: c.fontWeight,
        textAlign: c.textAlign,
        textColor: c.textColor,
        bgColor: c.bgColor,
        borderColor: c.borderColor,
        borderWidthPx: c.borderWidthPx,
        borderRadiusPx: c.borderRadiusPx,
        paddingPx: c.paddingPx ?? box.paddingPx ?? 0,
        paddingXPx: c.paddingXPx,
        paddingYPx: c.paddingYPx,
        letterSpacingPx: c.letterSpacingPx,
        wordSpacingPx: c.wordSpacingPx,
        lineHeight: c.lineHeight,
        textStrokeEnabled: c.textStrokeEnabled,
        textStrokeWidthPx: c.textStrokeWidthPx,
        textStrokeColor: c.textStrokeColor,
        isVisible: true,
      };
    }

    if (box.id === 'box-type' || box.role === 'type') {
      const c = official.compositeTitle;
      return {
        ...box,
        content: keepContent ? box.content : 'Site',
        xPercent: c.xPercent,
        yPercent: c.yPercent,
        widthPercent: c.widthPercent,
        heightPercent: c.heightPercent,
        fontSizePx: c.typeFontSizePx,
        fontFamily: c.typeFontFamily,
        fontWeight: c.typeFontWeight,
        textAlign: c.textAlign,
        textColor: c.typeTextColor,
        letterSpacingPx: c.typeLetterSpacingPx,
        textStrokeEnabled: c.typeTextStrokeEnabled,
        textStrokeWidthPx: c.typeTextStrokeWidthPx,
        textStrokeColor: c.typeTextStrokeColor,
        isVisible: true,
      };
    }

    return box;
  });
}

/**
 * Aplica o layout oficial do Site a uma configuração de SorceryIndicatorsConfig.
 */
export function applySiteOfficialLayoutToSorcery(
  sorcery: SorceryIndicatorsConfig,
  official: SiteOfficialLayout,
  keepQuantities: boolean = true
): SorceryIndicatorsConfig {
  return {
    ...sorcery,
    threshold: {
      ...sorcery.threshold,
      xPercent: official.threshold.xPercent,
      yPercent: official.threshold.yPercent,
      symbolWidthPercent: official.threshold.symbolWidthPercent,
      symbolHeightPercent: official.threshold.symbolHeightPercent,
      scale: official.threshold.scale,
      gapXPercent: official.threshold.gapXPercent,
      gapYPercent: official.threshold.gapYPercent,
      opacity: official.threshold.opacity,
      zIndex: official.threshold.zIndex,
      air: keepQuantities ? sorcery.threshold.air : 0,
      earth: keepQuantities ? sorcery.threshold.earth : 0,
      fire: keepQuantities ? sorcery.threshold.fire : 0,
      water: keepQuantities ? sorcery.threshold.water : 0,
      materia: keepQuantities ? (sorcery.threshold.materia || 0) : 0,
      vazio: keepQuantities ? (sorcery.threshold.vazio || 0) : 0,
      vida: keepQuantities ? (sorcery.threshold.vida || 0) : 0,
      morte: keepQuantities ? (sorcery.threshold.morte || 0) : 0,
    },
    combat: {
      ...sorcery.combat,
      siteCombatOption: official.combat.siteCombatOption,
      selectedType: official.combat.selectedType,
      single: {
        ...sorcery.combat.single,
        xPercent: official.combat.single.xPercent,
        yPercent: official.combat.single.yPercent,
        widthPercent: official.combat.single.widthPercent,
        heightPercent: official.combat.single.heightPercent,
        scale: official.combat.single.scale,
        attackXPercent: official.combat.single.attackXPercent,
        attackYPercent: official.combat.single.attackYPercent,
        value: keepQuantities ? sorcery.combat.single?.value ?? '0' : '0',
      },
      dual: {
        ...sorcery.combat.dual,
        xPercent: official.combat.dual.xPercent,
        yPercent: official.combat.dual.yPercent,
        widthPercent: official.combat.dual.widthPercent,
        heightPercent: official.combat.dual.heightPercent,
        scale: official.combat.dual.scale,
        attackXPercent: official.combat.dual.attackXPercent,
        attackYPercent: official.combat.dual.attackYPercent,
        defenseXPercent: official.combat.dual.defenseXPercent,
        defenseYPercent: official.combat.dual.defenseYPercent,
        attackValue: keepQuantities ? sorcery.combat.dual?.attackValue ?? '4' : '4',
        defenseValue: keepQuantities ? sorcery.combat.dual?.defenseValue ?? '5' : '5',
      },
    },
  };
}
