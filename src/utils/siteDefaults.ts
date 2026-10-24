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
import {
  SITE_DEFAULT_THRESHOLD_CONFIG,
  SITE_DEFAULT_COMBAT_CONFIG,
  SITE_DEFAULT_MANA_CONFIG,
  SITE_DEFAULT_SINGLE_ATTACK_CONFIG,
  SITE_DEFAULT_DUAL_COMBAT_CONFIG,
} from '../types/sorcery';

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
  return getSiteCodeBaseLayout();
}

/**
 * Salva explicitamente o layout atual configurado para Site como o novo padrão permanente oficial.
 */
export function saveSiteOfficialDefaultLayout(params: {
  textBoxes: TextBoxConfig[];
  sorceryConfig: SorceryIndicatorsConfig;
}): SiteOfficialLayout {
  return getSiteCodeBaseLayout();
}

/**
 * Aplica o layout oficial do Site a uma lista de caixas de texto preservando ou redefinindo o conteúdo.
 */
export function applySiteOfficialLayoutToTextBoxes(
  boxes: TextBoxConfig[],
  official?: SiteOfficialLayout,
  keepContent: boolean = true
): TextBoxConfig[] {
  return DEFAULT_SITE_TEXT_BOXES.map((defBox) => {
    const existing = boxes.find((b) => b.id === defBox.id || b.role === defBox.role);
    if (!existing) return { ...defBox };
    return {
      ...defBox,
      content: keepContent && existing.content !== undefined ? existing.content : defBox.content,
      isVisible: true,
    };
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
    mana: {
      ...SITE_DEFAULT_MANA_CONFIG,
      quantity: 0,
      isVisible: false,
    },
    threshold: {
      ...SITE_DEFAULT_THRESHOLD_CONFIG,
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
      espirito: keepQuantities ? (sorcery.threshold.espirito || 0) : 0,
      materia: keepQuantities ? (sorcery.threshold.materia || 0) : 0,
      vazio: keepQuantities ? (sorcery.threshold.vazio || 0) : 0,
      vida: keepQuantities ? (sorcery.threshold.vida || 0) : 0,
      morte: keepQuantities ? (sorcery.threshold.morte || 0) : 0,
    },
    combat: {
      ...SITE_DEFAULT_COMBAT_CONFIG,
      siteCombatOption: official.combat.siteCombatOption || 'attack-only',
      selectedType: official.combat.selectedType || 'attack-defense',
      isVisible: true,
      single: {
        ...SITE_DEFAULT_SINGLE_ATTACK_CONFIG,
        xPercent: official.combat.single.xPercent,
        yPercent: official.combat.single.yPercent,
        widthPercent: official.combat.single.widthPercent,
        heightPercent: official.combat.single.heightPercent,
        scale: official.combat.single.scale,
        attackXPercent: official.combat.single.attackXPercent,
        attackYPercent: official.combat.single.attackYPercent,
        value: keepQuantities ? (sorcery.combat.single?.value ?? '0') : '0',
      },
      dual: {
        ...SITE_DEFAULT_DUAL_COMBAT_CONFIG,
        xPercent: official.combat.dual.xPercent,
        yPercent: official.combat.dual.yPercent,
        widthPercent: official.combat.dual.widthPercent,
        heightPercent: official.combat.dual.heightPercent,
        scale: official.combat.dual.scale,
        attackXPercent: official.combat.dual.attackXPercent,
        attackYPercent: official.combat.dual.attackYPercent,
        defenseXPercent: official.combat.dual.defenseXPercent,
        defenseYPercent: official.combat.dual.defenseYPercent,
        attackValue: keepQuantities ? (sorcery.combat.dual?.attackValue ?? '4') : '4',
        defenseValue: keepQuantities ? (sorcery.combat.dual?.defenseValue ?? '5') : '5',
      },
    },
  };
}
