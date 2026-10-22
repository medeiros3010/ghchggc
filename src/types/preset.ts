import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  TextBoxConfig,
} from './card';

/**
 * ESTRUTURA DO MODELO DE CARTA (Card Layout Preset)
 * =========================================================
 * REGRA FUNDAMENTAL:
 * O modelo salva absolutamente tudo que compõe a estrutura,
 * estilo, moldura, símbolos e caixas de texto da carta,
 * EXCETO a arte principal (a ilustração do personagem/cenário).
 * 
 * Preserva, entretanto, as configurações de posicionamento,
 * proporção e enquadramento da área destinada à arte principal.
 * =========================================================
 */
export interface CardLayoutPreset {
  id: string;
  version: 1; // Versão do schema para garantia de retrocompatibilidade
  name: string; // Nome obrigatório do modelo
  description?: string; // Descrição opcional
  createdAt: string; // Data de criação ISO
  updatedAt: string; // Data da última modificação ISO
  isBuiltIn?: boolean; // Se é um modelo padrão inicial do app

  // 1. Dimensões físicas e proporções da carta
  dimensions: CardDimensionsConfig;

  // 2. Configurações de layout da área de arte (SEM a imagem)
  artLayout: {
    mode: 'full-bleed' | 'framed';
    fit: 'cover' | 'contain' | 'fill';
    opacity: number;
    frameTopPercent: number;
    frameHeightPercent: number;
    frameMarginPercent: number;
  };

  // 3. Cardframe / Moldura com imagem incorporada (Base64/SVG)
  frameConfig: CardFrameConfig;

  // 4. Imagens adicionais / Símbolos superiores (Mana e Ataque) com dados de imagem
  symbolsConfig: CardSymbolsConfig;

  // 5. Todas as caixas de texto com dados completos
  textBoxes: TextBoxConfig[];

  // 6. Configurações de Indicadores Sorcery: Mana & Threshold
  sorceryConfig?: import('./sorcery').SorceryIndicatorsConfig;

  // 7. Relação de fontes tipográficas exigidas pelo modelo
  requiredFonts?: string[];
}

export type PresetApplyMode = 'preserve-art' | 'blank-art';
