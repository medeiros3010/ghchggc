import { FontFamilyType } from './card';

export type SorceryElement =
  | 'air'
  | 'earth'
  | 'fire'
  | 'water'
  | 'espirito'
  | 'materia'
  | 'vazio'
  | 'vida'
  | 'morte';

export interface SorceryElementMetadata {
  id: SorceryElement;
  name: string;
  defaultPath: string;
  themeColor: string;
  glowColor: string;
  symbolDescription: string;
}

export const SORCERY_ELEMENTS: Record<SorceryElement, SorceryElementMetadata> = {
  fire: {
    id: 'fire',
    name: 'Fogo',
    defaultPath: '/assets/sorcery/threshold_fire.png',
    themeColor: '#ff6600',
    glowColor: 'rgba(255, 102, 0, 0.4)',
    symbolDescription: 'Triângulo ascendente com brilho alaranjado',
  },
  water: {
    id: 'water',
    name: 'Água',
    defaultPath: '/assets/sorcery/threshold_water.png',
    themeColor: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    symbolDescription: 'Triângulo descendente ciano luminoso',
  },
  earth: {
    id: 'earth',
    name: 'Terra',
    defaultPath: '/assets/sorcery/threshold_earth.png',
    themeColor: '#d4af37',
    glowColor: 'rgba(212, 175, 55, 0.4)',
    symbolDescription: 'Triângulo descendente com barra horizontal dourada',
  },
  air: {
    id: 'air',
    name: 'Ar',
    defaultPath: '/assets/sorcery/threshold_air.png',
    themeColor: '#b0d4f1',
    glowColor: 'rgba(176, 212, 241, 0.4)',
    symbolDescription: 'Triângulo ascendente com barra horizontal prateada',
  },
  espirito: {
    id: 'espirito',
    name: 'Espírito',
    defaultPath: '/assets/sorcery/Espirito.png',
    themeColor: '#4ea8de',
    glowColor: 'rgba(78, 168, 222, 0.4)',
    symbolDescription: 'Símbolo de Espírito: lâmina e losango azul celestial místico',
  },
  materia: {
    id: 'materia',
    name: 'Matéria',
    defaultPath: '/assets/sorcery/Matéria.png',
    themeColor: '#c5a675',
    glowColor: 'rgba(197, 166, 117, 0.4)',
    symbolDescription: 'Símbolo de Matéria: minerais e engrenagens com prisma dourado',
  },
  vazio: {
    id: 'vazio',
    name: 'Vazio',
    defaultPath: '/assets/sorcery/Vazio.png',
    themeColor: '#9353d3',
    glowColor: 'rgba(147, 83, 211, 0.4)',
    symbolDescription: 'Símbolo de Vazio: vórtice cósmico etéreo com estrela central',
  },
  vida: {
    id: 'vida',
    name: 'Vida',
    defaultPath: '/assets/sorcery/Vida.png',
    themeColor: '#52c41a',
    glowColor: 'rgba(82, 196, 26, 0.4)',
    symbolDescription: 'Símbolo de Vida: coração de vinhas e folhagens com gema brilhante',
  },
  morte: {
    id: 'morte',
    name: 'Morte',
    defaultPath: '/assets/sorcery/Morte.png',
    themeColor: '#8c8c8c',
    glowColor: 'rgba(140, 140, 140, 0.4)',
    symbolDescription: 'Símbolo de Morte: foice e elmo espectral com aura sombria',
  },
};

/**
 * Retorna o caminho oficial do arquivo de imagem do Threshold correspondente.
 * Mapeia rigorosamente os 5 novos modelos aos seus respectivos arquivos de imagem:
 * - Espirito.png -> Threshold Espírito
 * - Matéria.png  -> Threshold Matéria
 * - Vazio.png    -> Threshold Vazio
 * - Vida.png     -> Threshold Vida
 * - Morte.png    -> Threshold Morte
 * E preserva integralmente os modelos existentes:
 * - threshold_fire.png  -> Threshold Fogo
 * - threshold_water.png -> Threshold Água
 * - threshold_earth.png -> Threshold Terra
 * - threshold_air.png   -> Threshold Ar
 */
export function getThresholdElementImagePath(
  element: SorceryElement | string,
  elementImages?: Partial<Record<SorceryElement, string>>
): string {
  const norm = String(element || '').toLowerCase().trim();

  // Se houver uma imagem válida customizada em elementImages, utilize-a
  if (elementImages && (elementImages as any)[norm]) {
    const custom = (elementImages as any)[norm];
    if (typeof custom === 'string' && custom.trim() !== '') {
      return custom;
    }
  }

  switch (norm) {
    case 'espirito':
    case 'espírito':
      return '/assets/sorcery/Espirito.png';
    case 'materia':
    case 'matéria':
      return '/assets/sorcery/Matéria.png';
    case 'vazio':
      return '/assets/sorcery/Vazio.png';
    case 'vida':
      return '/assets/sorcery/Vida.png';
    case 'morte':
      return '/assets/sorcery/Morte.png';
    case 'fire':
    case 'fogo':
      return '/assets/sorcery/threshold_fire.png';
    case 'water':
    case 'água':
    case 'agua':
      return '/assets/sorcery/threshold_water.png';
    case 'earth':
    case 'terra':
      return '/assets/sorcery/threshold_earth.png';
    case 'air':
    case 'ar':
      return '/assets/sorcery/threshold_air.png';
    default:
      return (
        (SORCERY_ELEMENTS as any)[norm]?.defaultPath ||
        `/assets/sorcery/${element}.png`
      );
  }
}

/**
 * CONFIGURAÇÃO DO INDICADOR DE MANA
 * Composto por 2 camadas:
 * 1. A imagem `mana.png` (círculo metálico/esfera sem número).
 * 2. Um número editável centralizado sobre a imagem.
 */
export interface SorceryManaConfig {
  quantity: number; // Inteiro >= 0
  isVisible: boolean;
  xPercent: number; // Posição horizontal na carta (0% a 100%)
  yPercent: number; // Posição vertical na carta (0% a 100%)
  widthPercent: number; // Largura relativa na carta
  heightPercent: number; // Altura relativa na carta
  keepAspectRatio: boolean; // Preservar 1:1
  scale: number; // Multiplicador de escala (0.2 a 3.0)
  opacity: number; // 0 a 1
  zIndex: number; // Ordem de sobreposição
  imageUrl: string; // Caminho ou dataURL de mana.png

  // Configuração Tipográfica do Número de Mana
  fontFamily: FontFamilyType;
  fontSizePx: number;
  fontColor: string; // Cor do preenchimento do texto (padrão #ffffff)
  strokeColor: string; // Cor do contorno do texto (padrão #000000)
  strokeWidthPx: number; // Espessura do contorno (0 a 10)
  textOffsetX: number; // Ajuste fino horizontal em pixels (-30 a 30)
  textOffsetY: number; // Ajuste fino vertical em pixels (-30 a 30)
}

/**
 * CONFIGURAÇÃO DO SISTEMA DE THRESHOLD (ELEMENTOS)
 * Regra: Organizado em colunas de no máximo 2 símbolos na vertical.
 * Preenchimento: de cima para baixo (linha 0 depois linha 1), depois da esquerda para a direita.
 */
export interface SorceryThresholdConfig {
  isVisible: boolean;
  xPercent: number; // Posição X da primeira coluna
  yPercent: number; // Posição Y da linha superior
  distanceFromManaPercent: number; // Distância relativa em relação à bolinha de Mana

  // Quantidades elementais independentes (>= 0)
  air: number;
  earth: number;
  fire: number;
  water: number;
  espirito?: number;
  materia?: number;
  vazio?: number;
  vida?: number;
  morte?: number;

  // Ordem de preenchimento dos elementos
  elementOrder: SorceryElement[]; // Ordem configurável

  // Dimensões e Espaçamentos
  symbolWidthPercent: number; // Largura de cada símbolo em % da carta
  symbolHeightPercent: number; // Altura de cada símbolo em % da carta
  keepAspectRatio: boolean;
  scale: number; // Escala proporcional
  gapXPercent: number; // Espaçamento horizontal entre colunas (% da carta)
  gapYPercent: number; // Espaçamento vertical entre os 2 símbolos (% da carta)
  opacity: number; // Opacidade 0 a 1
  zIndex: number; // Ordem de sobreposição

  // Recursos de Imagem reutilizáveis
  elementImages: Record<SorceryElement, string>;
}

/**
 * Ponto de ancoragem percentual (0% a 100%) dentro da imagem do indicador.
 */
export interface SorceryNumberAnchor {
  xPercent: number; // 0% a 100% da largura da imagem
  yPercent: number; // 0% a 100% da altura da imagem
}

/**
 * Configuração visual independente para os números de Ataque e Defesa.
 */
export interface SorceryNumberStyleConfig {
  fontFamily: FontFamilyType;
  fontSizePx: number;
  fontColor: string; // Ex: '#ffffff'
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontStyle: 'normal' | 'italic';
  offsetX: number; // Deslocamento fino em pixels (-50 a 50)
  offsetY: number; // Deslocamento fino em pixels (-50 a 50)
  textAlign: 'left' | 'center' | 'right';
  textBaseline: 'top' | 'middle' | 'bottom';
  strokeWidthPx?: number; // Contorno opcional (padrão 0)
  strokeColor?: string;
}

/**
 * TIPO DE CRIATURA (MUTUAMENTE EXCLUSIVOS)
 * - 'attack-only': Criatura com apenas valor de ataque
 * - 'attack-defense': Criatura com valores de ataque e defesa
 */
export type CreatureCombatType = 'attack-only' | 'attack-defense';

/**
 * CONFIGURAÇÃO DO BLOCO A — CRIATURA COM ATAQUE
 * Estrutura 100% independente: imagem de fundo própria, elemento de ataque,
 * coordenadas X e Y próprias, dimensões e tipografia isoladas.
 */
export interface SingleAttackCombatConfig {
  value: string; // Ex: '4', '*', 'X'
  imageUrl: string; // Imagem de fundo específica (padrão attack_single.png)
  xPercent: number; // Posição horizontal na carta (padrão 84.5%)
  yPercent: number; // Posição vertical na carta (padrão 4.8%)
  widthPercent: number; // Largura relativa na carta (padrão 10.5%)
  heightPercent: number; // Altura relativa na carta (padrão 7.2%)
  keepAspectRatio: boolean;
  scale: number; // Multiplicador de escala (0.4 a 2.5)
  opacity: number; // Opacidade 0.1 a 1.0
  zIndex: number; // Ordem de sobreposição

  // Elemento / Imagem de Ataque associada
  attackImageUrl?: string; // Imagem/ícone opcional específico do ataque
  attackXPercent: number; // Posição X do elemento dentro do bloco (0% a 100%, padrão 50%)
  attackYPercent: number; // Posição Y do elemento dentro do bloco (0% a 100%, padrão 50%)
  style: SorceryNumberStyleConfig; // Tipografia completa do número de ataque
  numberAnchor?: SorceryNumberAnchor; // Âncora percentual
}

/**
 * CONFIGURAÇÃO DO BLOCO B — CRIATURA COM ATAQUE E DEFESA
 * Estrutura 100% independente: imagem de fundo própria, valores de ataque e defesa,
 * posições X e Y gerais e posições X e Y totalmente independentes para cada elemento.
 */
export interface DualCombatConfig {
  attackValue: string; // Ex: '4', '*', 'X'
  defenseValue: string; // Ex: '5', '*', 'X'
  backgroundImageUrl: string; // Imagem de fundo específica (padrão attack_defense.png)
  xPercent: number; // Posição horizontal geral na carta (padrão 74.0%)
  yPercent: number; // Posição vertical geral na carta (padrão 4.8%)
  widthPercent: number; // Largura geral na carta (padrão 21.0%)
  heightPercent: number; // Altura geral na carta (padrão 7.2%)
  keepAspectRatio: boolean;
  scale: number; // Multiplicador de escala (0.4 a 2.5)
  opacity: number; // Opacidade 0.1 a 1.0
  zIndex: number; // Ordem de sobreposição

  // Elemento e Imagem de ATAQUE (Posicionamento e controles independentes da defesa)
  attackImageUrl?: string; // Imagem ou ícone de ataque opcional
  attackXPercent: number; // Posição X do elemento de ataque dentro do bloco (padrão 25%)
  attackYPercent: number; // Posição Y do elemento de ataque dentro do bloco (padrão 50%)
  attackStyle: SorceryNumberStyleConfig; // Tipografia do número de ataque
  attackNumberAnchor?: SorceryNumberAnchor;

  // Elemento e Imagem de DEFESA (Posicionamento e controles independentes do ataque)
  defenseImageUrl?: string; // Imagem ou ícone de defesa opcional
  defenseXPercent: number; // Posição X do elemento de defesa dentro do bloco (padrão 72%)
  defenseYPercent: number; // Posição Y do elemento de defesa dentro do bloco (padrão 50%)
  defenseStyle: SorceryNumberStyleConfig; // Tipografia do número de defesa
  defenseNumberAnchor?: SorceryNumberAnchor;
}

export type SiteCombatOption = 'attack-only' | 'attack-defense' | 'none';

/**
 * CONFIGURAÇÃO GERAL DO INDICADOR DE COMBATE (ATAQUE E DEFESA)
 * Separação completa entre Criatura com Ataque e Criatura com Ataque e Defesa.
 */
export interface SorceryCombatConfig {
  selectedType: CreatureCombatType; // 'attack-only' | 'attack-defense'
  isVisible: boolean; // Visibilidade geral

  // Bloco A — Criatura com ataque (100% isolado)
  single: SingleAttackCombatConfig;

  // Bloco B — Criatura com ataque e defesa (100% isolado)
  dual: DualCombatConfig;

  // Configuração Exclusiva para cartas Site (3 opções: Somente Attack, Attack e Defense, Sem atributos)
  siteCombatOption?: SiteCombatOption;

  // Propriedades legadas mantidas para retrocompatibilidade
  attack?: string | number | null;
  defense?: string | number | null;
  xPercent?: number;
  yPercent?: number;
  widthPercent?: number;
  heightPercent?: number;
  keepAspectRatio?: boolean;
  scale?: number;
  opacity?: number;
  zIndex?: number;
  attackSingleUrl?: string;
  attackDefenseUrl?: string;
  attackStyle?: SorceryNumberStyleConfig;
  defenseStyle?: SorceryNumberStyleConfig;
  attackNumberAnchor?: SorceryNumberAnchor;
  defenseNumberAnchor?: SorceryNumberAnchor;
  singleAttackNumberAnchor?: SorceryNumberAnchor;
  isAdjustingNumbers?: boolean;
}

export type SorceryCombatMode = 'none' | 'single' | 'dual' | 'defense-only';

export function getCombatMode(combat?: Partial<SorceryCombatConfig> | null): SorceryCombatMode {
  if (!combat || combat.isVisible === false || combat.siteCombatOption === 'none') return 'none';

  if (combat.selectedType === 'attack-only') {
    const val = combat.single?.value ?? combat.attack;
    if (val !== null && val !== undefined && String(val).trim() !== '') {
      return 'single';
    }
    return 'none';
  }

  if (combat.selectedType === 'attack-defense') {
    const atk = combat.dual?.attackValue ?? combat.attack;
    const def = combat.dual?.defenseValue ?? combat.defense;
    const hasAtk = atk !== null && atk !== undefined && String(atk).trim() !== '';
    const hasDef = def !== null && def !== undefined && String(def).trim() !== '';

    if (hasAtk && hasDef) return 'dual';
    if (hasAtk && !hasDef) return 'single';
    if (!hasAtk && hasDef) return 'defense-only';
    return 'none';
  }

  // Fallback retrocompatível
  const hasAttack = combat.attack !== null && combat.attack !== undefined && String(combat.attack).trim() !== '';
  const hasDefense = combat.defense !== null && combat.defense !== undefined && String(combat.defense).trim() !== '';

  if (hasAttack && hasDefense) return 'dual';
  if (hasAttack && !hasDefense) return 'single';
  if (!hasAttack && hasDefense) return 'defense-only';
  return 'none';
}

export interface SorceryIndicatorsConfig {
  mana: SorceryManaConfig;
  threshold: SorceryThresholdConfig;
  combat: SorceryCombatConfig;
}

export const DEFAULT_ATTACK_STYLE: SorceryNumberStyleConfig = {
  fontFamily: 'morpheus',
  fontSizePx: 22,
  fontColor: '#ffffff',
  fontWeight: 'bold',
  fontStyle: 'normal',
  offsetX: 0,
  offsetY: 0,
  textAlign: 'center',
  textBaseline: 'middle',
  strokeWidthPx: 0,
  strokeColor: '#000000',
};

export const DEFAULT_DEFENSE_STYLE: SorceryNumberStyleConfig = {
  fontFamily: 'morpheus',
  fontSizePx: 22,
  fontColor: '#ffffff',
  fontWeight: 'bold',
  fontStyle: 'normal',
  offsetX: 0,
  offsetY: 0,
  textAlign: 'center',
  textBaseline: 'middle',
  strokeWidthPx: 0,
  strokeColor: '#000000',
};

/**
 * CONFIGURAÇÃO PADRÃO DEFINITIVA DO BLOCO A (CRIATURA COM ATAQUE INDIVIDUAL)
 * Preserva exatamente as coordenadas, dimensões, escala, imagem estática e tipografia
 */
export const PERMANENT_DEFAULT_SINGLE_ATTACK_CONFIG: SingleAttackCombatConfig = {
  value: '0',
  imageUrl: '/assets/sorcery/attack_single.png',
  xPercent: 84.2,
  yPercent: 3.0,
  widthPercent: 8.9,
  heightPercent: 6.1,
  keepAspectRatio: true,
  scale: 1.0,
  opacity: 1.0,
  zIndex: 60,
  attackXPercent: 49.0,
  attackYPercent: 42.0,
  style: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 1.0,
    strokeColor: '#ffffff',
  },
  numberAnchor: { xPercent: 50.0, yPercent: 50.0 },
  attackImageUrl: '',
};

export const DEFAULT_SINGLE_ATTACK_CONFIG: SingleAttackCombatConfig = PERMANENT_DEFAULT_SINGLE_ATTACK_CONFIG;

/**
 * CONFIGURAÇÃO PADRÃO DEFINITIVA DO BLOCO B (CRIATURA COM ATAQUE E DEFESA)
 * Preserva exatamente as coordenadas, dimensões, escala, imagem estática e tipografias independentes
 */
export const PERMANENT_DEFAULT_DUAL_COMBAT_CONFIG: DualCombatConfig = {
  attackValue: '4',
  defenseValue: '5',
  backgroundImageUrl: '/assets/sorcery/attack_defense.png',
  xPercent: 77.2,
  yPercent: 2.4,
  widthPercent: 19.4,
  heightPercent: 6.8,
  keepAspectRatio: true,
  scale: 1.0,
  opacity: 1.0,
  zIndex: 60,
  attackXPercent: 35.5,
  attackYPercent: 46.5,
  attackStyle: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 1.0,
    strokeColor: '#e1d6d6',
  },
  attackNumberAnchor: { xPercent: 25.0, yPercent: 50.0 },
  defenseXPercent: 65.0,
  defenseYPercent: 48.0,
  defenseStyle: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 1.0,
    strokeColor: '#dcd0d0',
  },
  defenseNumberAnchor: { xPercent: 72.0, yPercent: 50.0 },
};

export const DEFAULT_DUAL_COMBAT_CONFIG: DualCombatConfig = PERMANENT_DEFAULT_DUAL_COMBAT_CONFIG;

export const DEFAULT_SORCERY_COMBAT_CONFIG: SorceryCombatConfig = {
  selectedType: 'attack-only', // Seleção inicial padrão
  isVisible: true,
  single: PERMANENT_DEFAULT_SINGLE_ATTACK_CONFIG,
  dual: PERMANENT_DEFAULT_DUAL_COMBAT_CONFIG,

  // Campos de compatibilidade inicial
  attack: '4',
  defense: null,
  xPercent: 84.5,
  yPercent: 4.8,
  widthPercent: 10.5,
  heightPercent: 7.2,
  keepAspectRatio: true,
  scale: 1.0,
  opacity: 1.0,
  zIndex: 60,
  attackSingleUrl: '/assets/sorcery/attack_single.png',
  attackDefenseUrl: '/assets/sorcery/attack_defense.png',
  attackStyle: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#ffffff',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 0,
    strokeColor: '#000000',
  },
  defenseStyle: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#ffffff',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 0,
    strokeColor: '#000000',
  },
  attackNumberAnchor: { xPercent: 25.0, yPercent: 50.0 },
  defenseNumberAnchor: { xPercent: 72.0, yPercent: 50.0 },
  singleAttackNumberAnchor: { xPercent: 50.0, yPercent: 50.0 },
  isAdjustingNumbers: false,
};

/**
 * CONFIGURAÇÃO PADRÃO DEFINITIVA DE MANA
 */
export const PERMANENT_DEFAULT_MANA_CONFIG: SorceryManaConfig = {
  quantity: 0,
  isVisible: true,
  xPercent: 6.4,
  yPercent: 2.8,
  widthPercent: 9.5,
  heightPercent: 6.8,
  keepAspectRatio: true,
  scale: 0.85,
  opacity: 1.0,
  zIndex: 60,
  imageUrl: '/assets/sorcery/mana.png?v=2',
  fontFamily: 'morpheus',
  fontSizePx: 28,
  fontColor: '#000000',
  strokeColor: '#ffffff',
  strokeWidthPx: 0.5,
  textOffsetX: -1,
  textOffsetY: -4,
};

/**
 * CONFIGURAÇÃO PADRÃO DEFINITIVA DE THRESHOLD
 */
export const PERMANENT_DEFAULT_THRESHOLD_CONFIG: SorceryThresholdConfig = {
  isVisible: true,
  xPercent: 15.8,
  yPercent: 6.2,
  distanceFromManaPercent: 0.1,
  air: 0,
  earth: 0,
  fire: 0,
  water: 0,
  espirito: 0,
  materia: 0,
  vazio: 0,
  vida: 0,
  morte: 0,
  elementOrder: ['air', 'earth', 'fire', 'water', 'espirito', 'materia', 'vazio', 'vida', 'morte'],
  symbolWidthPercent: 4.8,
  symbolHeightPercent: 3.4,
  keepAspectRatio: true,
  scale: 0.8,
  gapXPercent: -11,
  gapYPercent: -0.4,
  opacity: 1.0,
  zIndex: 60,
  elementImages: {
    fire: '/assets/sorcery/threshold_fire.png',
    water: '/assets/sorcery/threshold_water.png',
    earth: '/assets/sorcery/threshold_earth.png',
    air: '/assets/sorcery/threshold_air.png',
    espirito: '/assets/sorcery/Espirito.png',
    materia: '/assets/sorcery/Matéria.png',
    vazio: '/assets/sorcery/Vazio.png',
    vida: '/assets/sorcery/Vida.png',
    morte: '/assets/sorcery/Morte.png',
  },
};

export const PERMANENT_DEFAULT_SORCERY_CONFIG: SorceryIndicatorsConfig = {
  mana: PERMANENT_DEFAULT_MANA_CONFIG,
  threshold: PERMANENT_DEFAULT_THRESHOLD_CONFIG,
  combat: DEFAULT_SORCERY_COMBAT_CONFIG,
};

export const DEFAULT_SORCERY_CONFIG: SorceryIndicatorsConfig = PERMANENT_DEFAULT_SORCERY_CONFIG;

/**
 * CONFIGURAÇÃO PADRÃO DEFINITIVA PARA CARTA SITE (PADRÃO 63 × 88 mm)
 * Reutiliza 100% da mesma estrutura funcional de Minion com distribuição otimizada
 */
export const SITE_DEFAULT_SINGLE_ATTACK_CONFIG: SingleAttackCombatConfig = {
  value: '0',
  imageUrl: '/assets/sorcery/attack_single.png',
  xPercent: 88.5,
  yPercent: 3.5,
  widthPercent: 7.0,
  heightPercent: 8.5,
  keepAspectRatio: true,
  scale: 1.0,
  opacity: 1.0,
  zIndex: 60,
  attackXPercent: 49.0,
  attackYPercent: 42.0,
  style: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 1.0,
    strokeColor: '#ffffff',
  },
  numberAnchor: { xPercent: 50.0, yPercent: 50.0 },
  attackImageUrl: '',
};

export const SITE_DEFAULT_DUAL_COMBAT_CONFIG: DualCombatConfig = {
  attackValue: '4',
  defenseValue: '5',
  backgroundImageUrl: '/assets/sorcery/attack_defense.png',
  xPercent: 81.5,
  yPercent: 3.0,
  widthPercent: 15.0,
  heightPercent: 9.5,
  keepAspectRatio: true,
  scale: 1.0,
  opacity: 1.0,
  zIndex: 60,
  attackXPercent: 35.5,
  attackYPercent: 46.5,
  attackStyle: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 1.0,
    strokeColor: '#e1d6d6',
  },
  attackNumberAnchor: { xPercent: 25.0, yPercent: 50.0 },
  defenseXPercent: 65.0,
  defenseYPercent: 48.0,
  defenseStyle: {
    fontFamily: 'morpheus',
    fontSizePx: 22,
    fontColor: '#000000',
    fontWeight: 'bold',
    fontStyle: 'normal',
    offsetX: 0,
    offsetY: 0,
    textAlign: 'center',
    textBaseline: 'middle',
    strokeWidthPx: 1.0,
    strokeColor: '#dcd0d0',
  },
  defenseNumberAnchor: { xPercent: 72.0, yPercent: 50.0 },
};

export const SITE_DEFAULT_COMBAT_CONFIG: SorceryCombatConfig = {
  selectedType: 'attack-only',
  isVisible: true,
  siteCombatOption: 'attack-only',
  single: SITE_DEFAULT_SINGLE_ATTACK_CONFIG,
  dual: SITE_DEFAULT_DUAL_COMBAT_CONFIG,
  attack: '0',
  defense: null,
  xPercent: 88.5,
  yPercent: 3.5,
  widthPercent: 7.0,
  heightPercent: 8.5,
  keepAspectRatio: true,
  scale: 1.0,
  opacity: 1.0,
  zIndex: 60,
  attackSingleUrl: '/assets/sorcery/attack_single.png',
  attackDefenseUrl: '/assets/sorcery/attack_defense.png',
  attackStyle: SITE_DEFAULT_SINGLE_ATTACK_CONFIG.style,
  defenseStyle: SITE_DEFAULT_DUAL_COMBAT_CONFIG.defenseStyle,
  attackNumberAnchor: { xPercent: 35.5, yPercent: 46.5 },
  defenseNumberAnchor: { xPercent: 65.0, yPercent: 48.0 },
  singleAttackNumberAnchor: { xPercent: 49.0, yPercent: 42.0 },
  isAdjustingNumbers: false,
};

export const SITE_DEFAULT_MANA_CONFIG: SorceryManaConfig = {
  quantity: 0,
  isVisible: false,
  xPercent: 0,
  yPercent: 0,
  widthPercent: 0,
  heightPercent: 0,
  keepAspectRatio: true,
  scale: 0.85,
  opacity: 0,
  zIndex: 0,
  imageUrl: '',
  fontFamily: 'morpheus',
  fontSizePx: 0,
  fontColor: '#000000',
  strokeColor: '#ffffff',
  strokeWidthPx: 0,
  textOffsetX: 0,
  textOffsetY: 0,
};

export const SITE_DEFAULT_THRESHOLD_CONFIG: SorceryThresholdConfig = {
  isVisible: true,
  xPercent: 5.5,
  yPercent: 6.8,
  distanceFromManaPercent: 0,
  air: 0,
  earth: 0,
  fire: 0,
  water: 0,
  espirito: 0,
  materia: 0,
  vazio: 0,
  vida: 0,
  morte: 0,
  elementOrder: ['air', 'earth', 'fire', 'water', 'espirito', 'materia', 'vazio', 'vida', 'morte'],
  symbolWidthPercent: 3.8,
  symbolHeightPercent: 5.2,
  keepAspectRatio: true,
  scale: 0.85,
  gapXPercent: 12,
  gapYPercent: 0,
  opacity: 1.0,
  zIndex: 60,
  elementImages: {
    fire: '/assets/sorcery/threshold_fire.png',
    water: '/assets/sorcery/threshold_water.png',
    earth: '/assets/sorcery/threshold_earth.png',
    air: '/assets/sorcery/threshold_air.png',
    espirito: '/assets/sorcery/Espirito.png',
    materia: '/assets/sorcery/Matéria.png',
    vazio: '/assets/sorcery/Vazio.png',
    vida: '/assets/sorcery/Vida.png',
    morte: '/assets/sorcery/Morte.png',
  },
};

export const SITE_DEFAULT_SORCERY_CONFIG: SorceryIndicatorsConfig = {
  mana: SITE_DEFAULT_MANA_CONFIG,
  threshold: SITE_DEFAULT_THRESHOLD_CONFIG,
  combat: SITE_DEFAULT_COMBAT_CONFIG,
};

export const DEFAULT_NON_COMBAT_SORCERY_CONFIG: SorceryIndicatorsConfig = {
  mana: PERMANENT_DEFAULT_MANA_CONFIG,
  threshold: PERMANENT_DEFAULT_THRESHOLD_CONFIG,
  combat: {
    ...DEFAULT_SORCERY_COMBAT_CONFIG,
    isVisible: false,
  },
};

export function getDefaultSorceryConfigForType(
  cardType?: import('./cardType').CardTypeId | null
): SorceryIndicatorsConfig {
  let config: SorceryIndicatorsConfig;
  switch (cardType) {
    case 'site':
      config = SITE_DEFAULT_SORCERY_CONFIG;
      break;
    case 'magic':
    case 'aura':
    case 'artifact':
      config = DEFAULT_NON_COMBAT_SORCERY_CONFIG;
      break;
    case 'avatar':
    case 'minion':
    default:
      config = PERMANENT_DEFAULT_SORCERY_CONFIG;
      break;
  }
  return JSON.parse(JSON.stringify(config));
}

/**
 * Representação de uma instância de símbolo posicionada no grid
 */
export interface DistributedThresholdItem {
  element: SorceryElement;
  index: number; // Índice global (0, 1, 2, ...)
  col: number; // Coluna (0, 1, 2, ...)
  row: number; // Linha (0 ou 1: máximo 2 linhas verticais!)
  xPercent: number; // Posição horizontal calculada da instância (canto superior esquerdo)
  yPercent: number; // Posição vertical calculada da instância (canto superior esquerdo)
  centerXPercent: number; // Coordenada X central do símbolo
  centerYPercent: number; // Coordenada Y central do símbolo
}

/**
 * REGRA PRINCIPAL DE DISTRIBUIÇÃO DOS THRESHOLDS:
 * - CADA COLUNA TEM NO MÁXIMO DOIS SÍMBOLOS NA VERTICAL.
 * - EM CONTAGENS PARES: Organização padrão em colunas de 2 símbolos (superior e inferior).
 * - EM CONTAGENS ÍMPARES (>= 3, ex: 3, 5, 7): O item excedente quebra o alinhamento
 *   rígido de colunas e posiciona-se no topo, centralizado horizontalmente em relação aos
 *   2 símbolos da base, formando uma pirâmide/triângulo perfeito.
 * - COM 1 SÍMBOLO: O símbolo fica centralizado verticalmente no eixo central (centerY).
 * - O ponto de referência padrão é o centro vertical da bolinha de Mana (com deslocamento manual opcional).
 */
export function computeThresholdDistribution(
  config: SorceryThresholdConfig,
  manaConfig?: SorceryManaConfig,
  allowedElements?: SorceryElement[],
  cardType?: import('./cardType').CardTypeId | null
): {
  items: DistributedThresholdItem[];
  totalColumns: number;
  totalSymbols: number;
  centerY: number;
  bounds: {
    startXPercent: number;
    startYPercent: number;
    widthPercent: number;
    heightPercent: number;
  };
} {
  // 1. Constrói a lista ordenada de símbolos elementais respeitando a prioridade de elementOrder e restrições de atributo
  const symbolList: SorceryElement[] = [];

  const allKnownElements: SorceryElement[] = [
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

  // Garante que effectiveOrder contenha todos os 9 elementos conhecidos
  const rawOrder = Array.isArray(config?.elementOrder) && config.elementOrder.length > 0
    ? config.elementOrder
    : allKnownElements;

  const effectiveOrder: SorceryElement[] = [];
  for (const elem of rawOrder) {
    if (allKnownElements.includes(elem) && !effectiveOrder.includes(elem)) {
      effectiveOrder.push(elem);
    }
  }
  for (const elem of allKnownElements) {
    if (!effectiveOrder.includes(elem)) {
      effectiveOrder.push(elem);
    }
  }

  const getElementCount = (elem: SorceryElement): number => {
    if (!config) return 0;
    const direct = Number((config as any)[elem]);
    if (!isNaN(direct) && direct > 0) return Math.floor(direct);

    // Suporte a chaves alternativas ou com acento
    if (elem === 'espirito') {
      const alt = Number(
        (config as any)['espírito'] ??
        (config as any)['Espírito'] ??
        (config as any)['Espirito']
      );
      if (!isNaN(alt) && alt > 0) return Math.floor(alt);
    } else if (elem === 'materia') {
      const alt = Number(
        (config as any)['matéria'] ??
        (config as any)['Matéria'] ??
        (config as any)['Materia']
      );
      if (!isNaN(alt) && alt > 0) return Math.floor(alt);
    } else if (elem === 'vazio') {
      const alt = Number((config as any)['Vazio']);
      if (!isNaN(alt) && alt > 0) return Math.floor(alt);
    } else if (elem === 'vida') {
      const alt = Number((config as any)['Vida']);
      if (!isNaN(alt) && alt > 0) return Math.floor(alt);
    } else if (elem === 'morte') {
      const alt = Number((config as any)['Morte']);
      if (!isNaN(alt) && alt > 0) return Math.floor(alt);
    }
    return 0;
  };

  for (const elem of effectiveOrder) {
    const count = getElementCount(elem);
    if (count <= 0) continue;

    // Se houver filtro de atributos permitidos, garante que os 5 novos modelos não sejam descartados
    // caso o usuário os tenha incrementado explicitamente na carta
    if (allowedElements && !allowedElements.includes(elem)) {
      if (!['espirito', 'materia', 'vazio', 'vida', 'morte'].includes(elem)) {
        continue;
      }
    }

    for (let c = 0; c < count; c++) {
      symbolList.push(elem);
    }
  }

  const totalSymbols = symbolList.length;

  const symWidth = config.symbolWidthPercent * config.scale;
  const symHeight = config.symbolHeightPercent * config.scale;
  const gapY = config.gapYPercent;
  // gapXPercent representa a distância horizontal entre as bordas visuais dos símbolos em % da largura do símbolo
  const gapX = (config.gapXPercent / 100) * symWidth;

  // Eixo central vertical de referência (centerY)
  // Para Site: usa exclusivamente o config.yPercent configurado
  // Para Minion/outros com Mana visível: centro vertical da bolinha de Mana + deslocamento manual
  let centerY: number;
  if (cardType !== 'site' && manaConfig && manaConfig.isVisible) {
    const manaCenterY = manaConfig.yPercent + manaConfig.heightPercent / 2;
    const manualOffsetY = config.yPercent !== undefined
      ? config.yPercent - DEFAULT_SORCERY_CONFIG.threshold.yPercent
      : 0;
    centerY = manaCenterY + manualOffsetY;
  } else {
    centerY = config.yPercent;
  }

  // Posição base horizontal (startX)
  let startX = config.xPercent;
  if (cardType !== 'site' && manaConfig && manaConfig.isVisible) {
    const manaScale = manaConfig.scale || 1.0;
    const manaCenterX = manaConfig.xPercent + manaConfig.widthPercent / 2;
    const manaRightEdge = manaCenterX + (manaConfig.widthPercent * manaScale) / 2;
    startX = manaRightEdge + (config.distanceFromManaPercent ?? 0.8);
  }

  if (totalSymbols === 0) {
    return {
      items: [],
      totalColumns: 0,
      totalSymbols: 0,
      centerY,
      bounds: {
        startXPercent: startX,
        startYPercent: centerY - symHeight / 2,
        widthPercent: 0,
        heightPercent: 0,
      },
    };
  }

  // EXCLUSIVO PARA CARTAS SITE: Distribuição em linha única horizontal da DIREITA para a ESQUERDA
  if (cardType === 'site') {
    const items: DistributedThresholdItem[] = [];
    for (let i = 0; i < totalSymbols; i++) {
      // O primeiro símbolo (i=0) permanece na âncora à direita (startX).
      // Cada símbolo adicional (i=1, 2, ...) posiciona-se à esquerda do anterior.
      const itemX = startX - i * (symWidth + gapX);
      const itemY = centerY - symHeight / 2;
      items.push({
        element: symbolList[i],
        index: i,
        col: i,
        row: 0,
        xPercent: itemX,
        yPercent: itemY,
        centerXPercent: itemX + symWidth / 2,
        centerYPercent: centerY,
      });
    }

    const totalWidth = totalSymbols > 0 ? symWidth + (totalSymbols - 1) * (symWidth + gapX) : 0;
    const leftmostX = totalSymbols > 0 ? startX - (totalSymbols - 1) * (symWidth + gapX) : startX;

    return {
      items,
      totalColumns: totalSymbols,
      totalSymbols,
      centerY,
      bounds: {
        startXPercent: leftmostX,
        startYPercent: centerY - symHeight / 2,
        widthPercent: totalWidth,
        heightPercent: symHeight,
      },
    };
  }

  const items: DistributedThresholdItem[] = [];
  const isOddWithPyramid = totalSymbols % 2 !== 0 && totalSymbols >= 3;

  if (totalSymbols === 1) {
    // 1 Símbolo: Centralizado verticalmente no eixo central
    items.push({
      element: symbolList[0],
      index: 0,
      col: 0,
      row: 0,
      xPercent: startX,
      yPercent: centerY - symHeight / 2,
      centerXPercent: startX + symWidth / 2,
      centerYPercent: centerY,
    });
  } else if (!isOddWithPyramid) {
    // Contagem Par (2, 4, 6, ...): Colunas completas de 2 símbolos cada
    for (let i = 0; i < totalSymbols; i++) {
      const col = Math.floor(i / 2);
      const row = i % 2; // 0 = superior, 1 = inferior

      let itemCenterY: number;
      let itemY: number;

      if (row === 0) {
        // Símbolo Superior
        itemCenterY = centerY - (symHeight + gapY) / 2;
        itemY = itemCenterY - symHeight / 2;
      } else {
        // Símbolo Inferior
        itemCenterY = centerY + (symHeight + gapY) / 2;
        itemY = itemCenterY - symHeight / 2;
      }

      const itemX = startX + col * (symWidth + gapX);
      const itemCenterX = itemX + symWidth / 2;

      items.push({
        element: symbolList[i],
        index: i,
        col,
        row,
        xPercent: itemX,
        yPercent: itemY,
        centerXPercent: itemCenterX,
        centerYPercent: itemCenterY,
      });
    }
  } else {
    // Contagem Ímpar >= 3 (3, 5, 7, ...):
    // As colunas anteriores são pares normais (2 símbolos por coluna).
    // Os últimos 3 símbolos quebram o alinhamento rígido e formam uma pirâmide/triângulo perfeito:
    // - 2 símbolos na base (inferior)
    // - 1 símbolo no topo, centralizado horizontalmente em relação aos 2 da base.
    const numFullCols = Math.floor((totalSymbols - 3) / 2);
    const pyramidStartIndex = numFullCols * 2; // ex: 0 para total 3, 2 para total 5, 4 para total 7

    // Colunas completas anteriores (se houver, como em 5 ou 7 símbolos)
    for (let i = 0; i < pyramidStartIndex; i++) {
      const col = Math.floor(i / 2);
      const row = i % 2;

      const itemCenterY = row === 0
        ? centerY - (symHeight + gapY) / 2
        : centerY + (symHeight + gapY) / 2;
      const itemY = itemCenterY - symHeight / 2;

      const itemX = startX + col * (symWidth + gapX);
      const itemCenterX = itemX + symWidth / 2;

      items.push({
        element: symbolList[i],
        index: i,
        col,
        row,
        xPercent: itemX,
        yPercent: itemY,
        centerXPercent: itemCenterX,
        centerYPercent: itemCenterY,
      });
    }

    // Pirâmide dos 3 últimos símbolos
    const baseCol = numFullCols;
    const leftBaseX = startX + baseCol * (symWidth + gapX);
    const rightBaseX = startX + (baseCol + 1) * (symWidth + gapX);
    const topCenterX = (leftBaseX + symWidth / 2 + rightBaseX + symWidth / 2) / 2;
    const topX = topCenterX - symWidth / 2; // = leftBaseX + (symWidth + gapX) / 2

    const baseY = centerY + (symHeight + gapY) / 2 - symHeight / 2; // centerY + gapY / 2
    const baseCenterY = centerY + (symHeight + gapY) / 2;

    const topY = centerY - (symHeight + gapY) / 2 - symHeight / 2; // centerY - symHeight - gapY / 2
    const topCenterY = centerY - (symHeight + gapY) / 2;

    // Símbolo 1 da Base (Esquerda, Linha Inferior)
    items.push({
      element: symbolList[pyramidStartIndex],
      index: pyramidStartIndex,
      col: baseCol,
      row: 1,
      xPercent: leftBaseX,
      yPercent: baseY,
      centerXPercent: leftBaseX + symWidth / 2,
      centerYPercent: baseCenterY,
    });

    // Símbolo 2 da Base (Direita, Linha Inferior)
    items.push({
      element: symbolList[pyramidStartIndex + 1],
      index: pyramidStartIndex + 1,
      col: baseCol + 1,
      row: 1,
      xPercent: rightBaseX,
      yPercent: baseY,
      centerXPercent: rightBaseX + symWidth / 2,
      centerYPercent: baseCenterY,
    });

    // Símbolo do Topo (Centralizado horizontalmente sobre os 2 da base, Linha Superior)
    items.push({
      element: symbolList[pyramidStartIndex + 2],
      index: pyramidStartIndex + 2,
      col: baseCol + 1,
      row: 0,
      xPercent: topX,
      yPercent: topY,
      centerXPercent: topCenterX,
      centerYPercent: topCenterY,
    });
  }

  const totalColumns = Math.ceil(totalSymbols / 2);
  const totalWidth = totalColumns * symWidth + Math.max(0, totalColumns - 1) * gapX;
  const hasTwoRowCol = totalSymbols >= 2;
  const totalHeight = hasTwoRowCol ? 2 * symHeight + gapY : symHeight;
  const startY = hasTwoRowCol ? centerY - symHeight - gapY / 2 : centerY - symHeight / 2;

  return {
    items,
    totalColumns,
    totalSymbols,
    centerY,
    bounds: {
      startXPercent: startX,
      startYPercent: startY,
      widthPercent: totalWidth,
      heightPercent: totalHeight,
    },
  };
}

/**
 * ARMAZENAMENTO PERSISTENTE DAS IMAGENS DE SORCERY (RECURSOS REUTILIZÁVEIS)
 */
const SORCERY_RESOURCES_STORAGE_KEY = 'cardforge_sorcery_resources_v1';

export function getStoredSorceryResources(): {
  manaUrl: string;
  elementImages: Record<SorceryElement, string>;
  attackSingleUrl: string;
  attackDefenseUrl: string;
} {
  try {
    const raw = localStorage.getItem(SORCERY_RESOURCES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        manaUrl: parsed.manaUrl || DEFAULT_SORCERY_CONFIG.mana.imageUrl,
        elementImages: {
          fire: parsed.elementImages?.fire || DEFAULT_SORCERY_CONFIG.threshold.elementImages.fire,
          water: parsed.elementImages?.water || DEFAULT_SORCERY_CONFIG.threshold.elementImages.water,
          earth: parsed.elementImages?.earth || DEFAULT_SORCERY_CONFIG.threshold.elementImages.earth,
          air: parsed.elementImages?.air || DEFAULT_SORCERY_CONFIG.threshold.elementImages.air,
          espirito: parsed.elementImages?.espirito || DEFAULT_SORCERY_CONFIG.threshold.elementImages.espirito,
          materia: parsed.elementImages?.materia || DEFAULT_SORCERY_CONFIG.threshold.elementImages.materia,
          vazio: parsed.elementImages?.vazio || DEFAULT_SORCERY_CONFIG.threshold.elementImages.vazio,
          vida: parsed.elementImages?.vida || DEFAULT_SORCERY_CONFIG.threshold.elementImages.vida,
          morte: parsed.elementImages?.morte || DEFAULT_SORCERY_CONFIG.threshold.elementImages.morte,
        },
        attackSingleUrl: parsed.attackSingleUrl || DEFAULT_SORCERY_COMBAT_CONFIG.attackSingleUrl,
        attackDefenseUrl: parsed.attackDefenseUrl || DEFAULT_SORCERY_COMBAT_CONFIG.attackDefenseUrl,
      };
    }
  } catch (err) {
    console.warn('Erro ao carregar recursos salvos de Sorcery:', err);
  }

  return {
    manaUrl: DEFAULT_SORCERY_CONFIG.mana.imageUrl,
    elementImages: { ...DEFAULT_SORCERY_CONFIG.threshold.elementImages },
    attackSingleUrl: DEFAULT_SORCERY_COMBAT_CONFIG.attackSingleUrl || DEFAULT_SINGLE_ATTACK_CONFIG.imageUrl,
    attackDefenseUrl: DEFAULT_SORCERY_COMBAT_CONFIG.attackDefenseUrl || DEFAULT_DUAL_COMBAT_CONFIG.backgroundImageUrl,
  };
}

export function saveStoredSorceryResources(resources: {
  manaUrl?: string;
  elementImages?: Partial<Record<SorceryElement, string>>;
  attackSingleUrl?: string;
  attackDefenseUrl?: string;
}) {
  try {
    const current = getStoredSorceryResources();
    const updated = {
      manaUrl: resources.manaUrl || current.manaUrl,
      elementImages: {
        ...current.elementImages,
        ...(resources.elementImages || {}),
      },
      attackSingleUrl: resources.attackSingleUrl || current.attackSingleUrl,
      attackDefenseUrl: resources.attackDefenseUrl || current.attackDefenseUrl,
    };
    localStorage.setItem(SORCERY_RESOURCES_STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Erro ao salvar recursos de Sorcery no localStorage:', err);
  }
}

const SORCERY_CONFIG_STORAGE_KEY = 'cardforge_sorcery_config_v1';
const SITE_SORCERY_CONFIG_STORAGE_KEY = 'cardforge_sorcery_config_site_v1';
const CURRENT_LAYOUT_VERSION_KEY = 'cardforge_default_layout_version';
const CURRENT_DEFAULT_LAYOUT_VERSION = 'v4_attached';

export function getSorceryStorageKey(cardType?: import('./cardType').CardTypeId | null): string {
  if (cardType === 'site') return SITE_SORCERY_CONFIG_STORAGE_KEY;
  if (!cardType || cardType === 'minion') return SORCERY_CONFIG_STORAGE_KEY;
  return `cardforge_sorcery_config_${cardType}_v1`;
}

export function getStoredSorceryConfig(cardType?: import('./cardType').CardTypeId | null): SorceryIndicatorsConfig {
  const isSite = cardType === 'site';
  const defaultBase = getDefaultSorceryConfigForType(cardType);
  const storageKey = getSorceryStorageKey(cardType);

  try {
    const installedVersion = localStorage.getItem(CURRENT_LAYOUT_VERSION_KEY);
    if (installedVersion !== CURRENT_DEFAULT_LAYOUT_VERSION) {
      localStorage.setItem(CURRENT_LAYOUT_VERSION_KEY, CURRENT_DEFAULT_LAYOUT_VERSION);
      const initial = JSON.parse(JSON.stringify(defaultBase));
      localStorage.setItem(storageKey, JSON.stringify(initial));
      return initial;
    }

    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      const manaImageUrl = parsed.mana?.imageUrl && !parsed.mana.imageUrl.includes('data:')
        ? '/assets/sorcery/mana.png?v=2'
        : (parsed.mana?.imageUrl || defaultBase.mana.imageUrl);

      const parsedCombat = parsed.combat || {};

      // 1. Determinação do Tipo Selecionado ('attack-only' ou 'attack-defense')
      let selectedType: CreatureCombatType = 'attack-only';
      if (parsedCombat.selectedType === 'attack-only' || parsedCombat.selectedType === 'attack-defense') {
        selectedType = parsedCombat.selectedType;
      } else if (parsedCombat.defense !== null && parsedCombat.defense !== undefined && String(parsedCombat.defense).trim() !== '') {
        selectedType = 'attack-defense';
      }

      // 2. Restauração do Bloco A — Criatura com Ataque (100% independente)
      const rawSingle = parsedCombat.single || {};
      const singleStyle: SorceryNumberStyleConfig = {
        ...DEFAULT_ATTACK_STYLE,
        ...(rawSingle.style || parsedCombat.attackStyle || {}),
        fontFamily: rawSingle.style?.fontFamily || parsedCombat.attackStyle?.fontFamily || DEFAULT_ATTACK_STYLE.fontFamily,
        fontSizePx: rawSingle.style?.fontSizePx ?? parsedCombat.attackStyle?.fontSizePx ?? DEFAULT_ATTACK_STYLE.fontSizePx,
        fontColor: rawSingle.style?.fontColor || parsedCombat.attackStyle?.fontColor || DEFAULT_ATTACK_STYLE.fontColor,
        fontWeight: rawSingle.style?.fontWeight || parsedCombat.attackStyle?.fontWeight || DEFAULT_ATTACK_STYLE.fontWeight,
        fontStyle: rawSingle.style?.fontStyle || parsedCombat.attackStyle?.fontStyle || DEFAULT_ATTACK_STYLE.fontStyle,
        offsetX: rawSingle.style?.offsetX ?? parsedCombat.attackStyle?.offsetX ?? 0,
        offsetY: rawSingle.style?.offsetY ?? parsedCombat.attackStyle?.offsetY ?? 0,
        textAlign: rawSingle.style?.textAlign || 'center',
        textBaseline: rawSingle.style?.textBaseline || 'middle',
        strokeWidthPx: rawSingle.style?.strokeWidthPx ?? parsedCombat.attackStyle?.strokeWidthPx ?? 0,
        strokeColor: rawSingle.style?.strokeColor || parsedCombat.attackStyle?.strokeColor || '#000000',
      };

      const singleFallback = isSite ? SITE_DEFAULT_SINGLE_ATTACK_CONFIG : DEFAULT_SINGLE_ATTACK_CONFIG;
      const singleConfig: SingleAttackCombatConfig = {
        ...singleFallback,
        ...rawSingle,
        value: rawSingle.value !== undefined
          ? String(rawSingle.value)
          : (parsedCombat.attack !== undefined && parsedCombat.attack !== null ? String(parsedCombat.attack) : '0'),
        imageUrl: rawSingle.imageUrl || parsedCombat.attackSingleUrl || singleFallback.imageUrl,
        xPercent: rawSingle.xPercent ?? parsedCombat.singleXPercent ?? parsedCombat.xPercent ?? singleFallback.xPercent,
        yPercent: rawSingle.yPercent ?? parsedCombat.singleYPercent ?? parsedCombat.yPercent ?? singleFallback.yPercent,
        widthPercent: rawSingle.widthPercent ?? parsedCombat.singleWidthPercent ?? singleFallback.widthPercent,
        heightPercent: rawSingle.heightPercent ?? parsedCombat.singleHeightPercent ?? singleFallback.heightPercent,
        keepAspectRatio: rawSingle.keepAspectRatio ?? parsedCombat.keepAspectRatio ?? true,
        scale: rawSingle.scale ?? parsedCombat.scale ?? 1.0,
        opacity: rawSingle.opacity ?? parsedCombat.opacity ?? 1.0,
        zIndex: rawSingle.zIndex ?? parsedCombat.zIndex ?? 60,
        attackXPercent: rawSingle.attackXPercent ?? (parsedCombat.singleAttackNumberAnchor?.xPercent ?? 50.0),
        attackYPercent: rawSingle.attackYPercent ?? (parsedCombat.singleAttackNumberAnchor?.yPercent ?? 50.0),
        attackImageUrl: rawSingle.attackImageUrl || undefined,
        style: singleStyle,
      };

      // 3. Restauração do Bloco B — Criatura com Ataque e Defesa (100% independente)
      const rawDual = parsedCombat.dual || {};
      const dualAttackStyle: SorceryNumberStyleConfig = {
        ...DEFAULT_ATTACK_STYLE,
        ...(rawDual.attackStyle || parsedCombat.attackStyle || {}),
        fontFamily: rawDual.attackStyle?.fontFamily || parsedCombat.attackStyle?.fontFamily || DEFAULT_ATTACK_STYLE.fontFamily,
        fontSizePx: rawDual.attackStyle?.fontSizePx ?? parsedCombat.attackStyle?.fontSizePx ?? DEFAULT_ATTACK_STYLE.fontSizePx,
        fontColor: rawDual.attackStyle?.fontColor || parsedCombat.attackStyle?.fontColor || DEFAULT_ATTACK_STYLE.fontColor,
        fontWeight: rawDual.attackStyle?.fontWeight || DEFAULT_ATTACK_STYLE.fontWeight,
        fontStyle: rawDual.attackStyle?.fontStyle || DEFAULT_ATTACK_STYLE.fontStyle,
        offsetX: rawDual.attackStyle?.offsetX ?? parsedCombat.attackStyle?.offsetX ?? 0,
        offsetY: rawDual.attackStyle?.offsetY ?? parsedCombat.attackStyle?.offsetY ?? 0,
        textAlign: rawDual.attackStyle?.textAlign || 'center',
        textBaseline: rawDual.attackStyle?.textBaseline || 'middle',
        strokeWidthPx: rawDual.attackStyle?.strokeWidthPx ?? 0,
        strokeColor: rawDual.attackStyle?.strokeColor || '#000000',
      };

      const dualDefenseStyle: SorceryNumberStyleConfig = {
        ...DEFAULT_DEFENSE_STYLE,
        ...(rawDual.defenseStyle || parsedCombat.defenseStyle || {}),
        fontFamily: rawDual.defenseStyle?.fontFamily || parsedCombat.defenseStyle?.fontFamily || DEFAULT_DEFENSE_STYLE.fontFamily,
        fontSizePx: rawDual.defenseStyle?.fontSizePx ?? parsedCombat.defenseStyle?.fontSizePx ?? DEFAULT_DEFENSE_STYLE.fontSizePx,
        fontColor: rawDual.defenseStyle?.fontColor || parsedCombat.defenseStyle?.fontColor || DEFAULT_DEFENSE_STYLE.fontColor,
        fontWeight: rawDual.defenseStyle?.fontWeight || DEFAULT_DEFENSE_STYLE.fontWeight,
        fontStyle: rawDual.defenseStyle?.fontStyle || DEFAULT_DEFENSE_STYLE.fontStyle,
        offsetX: rawDual.defenseStyle?.offsetX ?? parsedCombat.defenseStyle?.offsetX ?? 0,
        offsetY: rawDual.defenseStyle?.offsetY ?? parsedCombat.defenseStyle?.offsetY ?? 0,
        textAlign: rawDual.defenseStyle?.textAlign || 'center',
        textBaseline: rawDual.defenseStyle?.textBaseline || 'middle',
        strokeWidthPx: rawDual.defenseStyle?.strokeWidthPx ?? 0,
        strokeColor: rawDual.defenseStyle?.strokeColor || '#000000',
      };

      const dualFallback = isSite ? SITE_DEFAULT_DUAL_COMBAT_CONFIG : DEFAULT_DUAL_COMBAT_CONFIG;
      const dualConfig: DualCombatConfig = {
        ...dualFallback,
        ...rawDual,
        attackValue: rawDual.attackValue !== undefined
          ? String(rawDual.attackValue)
          : (parsedCombat.attack !== undefined && parsedCombat.attack !== null ? String(parsedCombat.attack) : '4'),
        defenseValue: rawDual.defenseValue !== undefined
          ? String(rawDual.defenseValue)
          : (parsedCombat.defense !== undefined && parsedCombat.defense !== null ? String(parsedCombat.defense) : '5'),
        backgroundImageUrl: rawDual.backgroundImageUrl || parsedCombat.attackDefenseUrl || dualFallback.backgroundImageUrl,
        xPercent: rawDual.xPercent ?? parsedCombat.dualXPercent ?? dualFallback.xPercent,
        yPercent: rawDual.yPercent ?? parsedCombat.dualYPercent ?? parsedCombat.yPercent ?? dualFallback.yPercent,
        widthPercent: rawDual.widthPercent ?? parsedCombat.dualWidthPercent ?? dualFallback.widthPercent,
        heightPercent: rawDual.heightPercent ?? parsedCombat.dualHeightPercent ?? parsedCombat.heightPercent ?? dualFallback.heightPercent,
        keepAspectRatio: rawDual.keepAspectRatio ?? parsedCombat.keepAspectRatio ?? true,
        scale: rawDual.scale ?? parsedCombat.scale ?? 1.0,
        opacity: rawDual.opacity ?? parsedCombat.opacity ?? 1.0,
        zIndex: rawDual.zIndex ?? parsedCombat.zIndex ?? 60,
        attackXPercent: rawDual.attackXPercent ?? (parsedCombat.attackNumberAnchor?.xPercent ?? 25.0),
        attackYPercent: rawDual.attackYPercent ?? (parsedCombat.attackNumberAnchor?.yPercent ?? 50.0),
        attackImageUrl: rawDual.attackImageUrl || undefined,
        attackStyle: dualAttackStyle,
        defenseXPercent: rawDual.defenseXPercent ?? (parsedCombat.defenseNumberAnchor?.xPercent ?? 72.0),
        defenseYPercent: rawDual.defenseYPercent ?? (parsedCombat.defenseNumberAnchor?.yPercent ?? 50.0),
        defenseImageUrl: rawDual.defenseImageUrl || undefined,
        defenseStyle: dualDefenseStyle,
      };

      const combatConfig: SorceryCombatConfig = {
        selectedType,
        isVisible: parsedCombat.isVisible !== undefined ? parsedCombat.isVisible : true,
        single: singleConfig,
        dual: dualConfig,

        // Sincronização de campos de compatibilidade
        attack: selectedType === 'attack-only' ? singleConfig.value : dualConfig.attackValue,
        defense: selectedType === 'attack-only' ? null : dualConfig.defenseValue,
        attackSingleUrl: singleConfig.imageUrl,
        attackDefenseUrl: dualConfig.backgroundImageUrl,
        xPercent: selectedType === 'attack-only' ? singleConfig.xPercent : dualConfig.xPercent,
        yPercent: selectedType === 'attack-only' ? singleConfig.yPercent : dualConfig.yPercent,
        widthPercent: selectedType === 'attack-only' ? singleConfig.widthPercent : dualConfig.widthPercent,
        heightPercent: selectedType === 'attack-only' ? singleConfig.heightPercent : dualConfig.heightPercent,
        keepAspectRatio: selectedType === 'attack-only' ? singleConfig.keepAspectRatio : dualConfig.keepAspectRatio,
        scale: selectedType === 'attack-only' ? singleConfig.scale : dualConfig.scale,
        opacity: selectedType === 'attack-only' ? singleConfig.opacity : dualConfig.opacity,
        zIndex: selectedType === 'attack-only' ? singleConfig.zIndex : dualConfig.zIndex,
        attackStyle: selectedType === 'attack-only' ? singleConfig.style : dualConfig.attackStyle,
        defenseStyle: dualConfig.defenseStyle,
        attackNumberAnchor: { xPercent: dualConfig.attackXPercent, yPercent: dualConfig.attackYPercent },
        defenseNumberAnchor: { xPercent: dualConfig.defenseXPercent, yPercent: dualConfig.defenseYPercent },
        singleAttackNumberAnchor: { xPercent: singleConfig.attackXPercent, yPercent: singleConfig.attackYPercent },
      };

      return {
        mana: {
          ...defaultBase.mana,
          ...(parsed.mana || {}),
          imageUrl: manaImageUrl,
          strokeWidthPx: parsed.mana?.strokeWidthPx !== undefined ? parsed.mana.strokeWidthPx : 0,
        },
        threshold: {
          ...defaultBase.threshold,
          ...(parsed.threshold || {}),
          elementImages: {
            ...defaultBase.threshold.elementImages,
            ...(parsed.threshold?.elementImages || {}),
          },
          elementOrder: (() => {
            const current = [...(parsed.threshold?.elementOrder || defaultBase.threshold.elementOrder)];
            for (const el of defaultBase.threshold.elementOrder) {
              if (!current.includes(el)) current.push(el);
            }
            return current;
          })(),
          espirito: parsed.threshold?.espirito || 0,
          materia: parsed.threshold?.materia || 0,
          vazio: parsed.threshold?.vazio || 0,
          vida: parsed.threshold?.vida || 0,
          morte: parsed.threshold?.morte || 0,
          isVisible: parsed.threshold?.isVisible !== undefined ? parsed.threshold.isVisible : true,
          yPercent:
            parsed.threshold?.yPercent === 5.3 ||
            parsed.threshold?.yPercent === 5.7 ||
            parsed.threshold?.yPercent === undefined
              ? defaultBase.threshold.yPercent
              : parsed.threshold.yPercent,
          symbolWidthPercent:
            parsed.threshold?.symbolWidthPercent && parsed.threshold.symbolWidthPercent <= 5.5
              ? parsed.threshold.symbolWidthPercent
              : defaultBase.threshold.symbolWidthPercent,
          symbolHeightPercent:
            parsed.threshold?.symbolHeightPercent && parsed.threshold.symbolHeightPercent <= 4.8
              ? parsed.threshold.symbolHeightPercent
              : defaultBase.threshold.symbolHeightPercent,
        },
        combat: combatConfig,
      };
    }
  } catch (err) {
    console.warn('Erro ao carregar sorceryConfig do localStorage:', err);
  }

  return JSON.parse(JSON.stringify(defaultBase));
}

export function saveStoredSorceryConfig(
  config: SorceryIndicatorsConfig,
  cardType?: import('./cardType').CardTypeId | null
) {
  try {
    const isSite = cardType === 'site';
    const storageKey = getSorceryStorageKey(cardType);
    const defaultSingle = isSite ? SITE_DEFAULT_SINGLE_ATTACK_CONFIG : DEFAULT_SINGLE_ATTACK_CONFIG;
    const defaultDual = isSite ? SITE_DEFAULT_DUAL_COMBAT_CONFIG : DEFAULT_DUAL_COMBAT_CONFIG;

    // Sincroniza campos legados para manter compatibilidade com quaisquer leitores externos
    const selectedType = config.combat.selectedType || 'attack-only';
    const single = config.combat.single || defaultSingle;
    const dual = config.combat.dual || defaultDual;

    const synchronizedCombat: SorceryCombatConfig = {
      ...config.combat,
      selectedType,
      single,
      dual,
      attack: selectedType === 'attack-only' ? single.value : dual.attackValue,
      defense: selectedType === 'attack-only' ? null : dual.defenseValue,
      attackSingleUrl: single.imageUrl,
      attackDefenseUrl: dual.backgroundImageUrl,
      xPercent: selectedType === 'attack-only' ? single.xPercent : dual.xPercent,
      yPercent: selectedType === 'attack-only' ? single.yPercent : dual.yPercent,
      widthPercent: selectedType === 'attack-only' ? single.widthPercent : dual.widthPercent,
      heightPercent: selectedType === 'attack-only' ? single.heightPercent : dual.heightPercent,
      scale: selectedType === 'attack-only' ? single.scale : dual.scale,
      opacity: selectedType === 'attack-only' ? single.opacity : dual.opacity,
      zIndex: selectedType === 'attack-only' ? single.zIndex : dual.zIndex,
      keepAspectRatio: selectedType === 'attack-only' ? single.keepAspectRatio : dual.keepAspectRatio,
      attackStyle: selectedType === 'attack-only' ? single.style : dual.attackStyle,
      defenseStyle: dual.defenseStyle,
    };

    const toSave: SorceryIndicatorsConfig = {
      ...config,
      combat: synchronizedCombat,
    };

    localStorage.setItem(storageKey, JSON.stringify(toSave));
    // Salva também nas chaves legadas para compatibilidade reversa
    if (isSite) {
      localStorage.setItem(SITE_SORCERY_CONFIG_STORAGE_KEY, JSON.stringify(toSave));
    } else if (!cardType || cardType === 'minion') {
      localStorage.setItem(SORCERY_CONFIG_STORAGE_KEY, JSON.stringify(toSave));
    }
  } catch (err) {
    console.warn('Erro ao salvar sorceryConfig no localStorage:', err);
  }
}

/**
 * Cria uma nova configuração de Sorcery preservando 100% dos ajustes visuais
 * (coordenadas X/Y, fontes, cores, tamanhos, espaçamentos, escalas e imagens),
 * e limpando/redefinindo apenas os valores da carta.
 */
export function createNewCardSorceryConfig(
  currentVisuals?: SorceryIndicatorsConfig,
  cardType?: import('./cardType').CardTypeId | null
): SorceryIndicatorsConfig {
  const defaultFallback = getDefaultSorceryConfigForType(cardType);
  const base = currentVisuals || getStoredSorceryConfig(cardType);
  const hasCombat = cardType === 'minion' || cardType === 'site';

  // Assegura 6.2% como novo padrão permanente ao iniciar uma nova carta
  const targetYPercent =
    base.threshold?.yPercent === 5.3 ||
    base.threshold?.yPercent === 5.7 ||
    base.threshold?.yPercent === undefined
      ? defaultFallback.threshold.yPercent
      : base.threshold.yPercent;

  return {
    mana: {
      ...base.mana,
      quantity: 0,
    },
    threshold: {
      ...base.threshold,
      yPercent: targetYPercent,
      air: 0,
      earth: 0,
      fire: 0,
      water: 0,
      espirito: 0,
      materia: 0,
      vazio: 0,
      vida: 0,
      morte: 0,
    },
    combat: {
      ...base.combat,
      selectedType: 'attack-only',
      isVisible: hasCombat,
      single: {
        ...(base.combat?.single || defaultFallback.combat.single),
        value: '0',
      },
      dual: {
        ...(base.combat?.dual || defaultFallback.combat.dual),
        attackValue: '4',
        defenseValue: '5',
      },
      attack: '0',
      defense: null,
    },
  };
}

/**
 * Restaura todas as configurações visuais para o padrão definitivo e permanente
 */
export function resetVisualsToPermanentDefaults(
  keepCardValues: boolean = true,
  current?: SorceryIndicatorsConfig,
  cardType?: import('./cardType').CardTypeId | null
): SorceryIndicatorsConfig {
  const defaultBase = getDefaultSorceryConfigForType(cardType);
  const perm = JSON.parse(JSON.stringify(defaultBase)) as SorceryIndicatorsConfig;
  if (!keepCardValues || !current) {
    saveStoredSorceryConfig(perm, cardType);
    return perm;
  }
  const merged: SorceryIndicatorsConfig = {
    ...perm,
    mana: {
      ...perm.mana,
      quantity: current.mana.quantity,
    },
    threshold: {
      ...perm.threshold,
      fire: current.threshold.fire,
      water: current.threshold.water,
      earth: current.threshold.earth,
      air: current.threshold.air,
      espirito: current.threshold.espirito || 0,
      materia: current.threshold.materia || 0,
      vazio: current.threshold.vazio || 0,
      vida: current.threshold.vida || 0,
      morte: current.threshold.morte || 0,
    },
    combat: {
      ...perm.combat,
      selectedType: current.combat.selectedType,
      isVisible: current.combat.isVisible,
      single: {
        ...perm.combat.single,
        value: current.combat.single?.value ?? '0',
      },
      dual: {
        ...perm.combat.dual,
        attackValue: current.combat.dual?.attackValue ?? '4',
        defenseValue: current.combat.dual?.defenseValue ?? '',
      },
      attack: current.combat.attack,
      defense: current.combat.defense,
    },
  };
  saveStoredSorceryConfig(merged, cardType);
  return merged;
}



