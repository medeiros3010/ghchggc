import {
  CardArtConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  CustomSymbolConfig,
  TextBoxConfig,
} from '../types/card';

/**
 * PRESETS INICIAIS DE CAIXAS DE TEXTO
 * 
 * Aqui você pode ajustar os valores padrões iniciais de cada caixa de texto
 * (Nome, Tipo, Descrição, Atributos, etc.).
 * 
 * xPercent e yPercent: Determinam o ponto de origem (canto superior esquerdo)
 * da caixa como percentual da largura e altura da carta (0 a 100).
 * widthPercent: Largura da caixa em percentual (ex: 88 = 88% da largura da carta).
 */
export const DEFAULT_TCG_TEXT_BOXES: TextBoxConfig[] = [
  {
    id: 'box-title',
    role: 'title',
    name: 'Nome da Carta',
    content: 'Guardião do Vazio',
    xPercent: 6.6,
    yPercent: 3.7,
    widthPercent: 87,
    heightPercent: 5.7,
    fontSizePx: 19,
    fontWeight: 'bold',
    fontFamily: 'fantaisie-artistique',
    textAlign: 'center',
    textColor: '#ffffff',
    bgColor: 'transparent',
    borderColor: '#cbd5e1',
    borderWidthPx: 0,
    borderRadiusPx: 6,
    paddingPx: 0,
    paddingXPx: 0,
    paddingYPx: 0,
    isLocked: false,
    isMultiline: false,
    isVisible: true,
    autoFitText: true,
    minFontSizePx: 8,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.8,
    textStrokeColor: '#000000',
  },
  {
    id: 'box-type',
    role: 'type',
    name: 'Tipo / Subtipo',
    content: 'An Elite Dragon of  breathtaking majesty',
    xPercent: 6.8,
    yPercent: 72.4,
    widthPercent: 86.5,
    heightPercent: 4.9,
    fontSizePx: 15,
    fontWeight: 'bold',
    fontFamily: 'fantaisie-artistique',
    textAlign: 'center',
    textColor: '#ffffff',
    bgColor: 'transparent',
    borderColor: '#e2e8f0',
    borderWidthPx: 0,
    borderRadiusPx: 4,
    paddingPx: 0,
    paddingXPx: 0,
    paddingYPx: 0,
    isLocked: false,
    isMultiline: false,
    isVisible: false,
    autoFitText: true,
    minFontSizePx: 7,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.8,
    textStrokeColor: '#000000',
  },
  {
    id: 'box-description',
    role: 'rules',
    name: 'Caixa de Regras / Descrição',
    content: '',
    xPercent: 8.8,
    yPercent: 76.4,
    widthPercent: 82.9,
    heightPercent: 17,
    fontSizePx: 14,
    fontWeight: 'normal',
    fontFamily: 'book-antiqua',
    textAlign: 'left',
    textColor: '#000000',
    bgColor: 'transparent',
    borderColor: '#cbd5e1',
    borderWidthPx: 0,
    borderRadiusPx: 6,
    paddingPx: 11,
    paddingXPx: 11,
    paddingYPx: 15,
    isLocked: false,
    isMultiline: true,
    isVisible: false,
    autoFitText: true,
    minFontSizePx: 4,
    letterSpacingPx: 0,
    paragraphSpacingPx: 2,
    lineHeight: 1.45,
    paragraphAlignments: ['left', 'left', 'center'],
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.1,
    textStrokeColor: '#000000',
  },
  {
    id: 'box-footer',
    role: 'footer',
    name: 'Rodapé / Numeração',
    content: 'art @ Vicent Pompetti',
    xPercent: 10.3,
    yPercent: 95,
    widthPercent: 80.1,
    heightPercent: 3.4,
    fontSizePx: 13,
    fontWeight: 'normal',
    fontFamily: 'palatino-italic',
    textAlign: 'center',
    textColor: '#ffffff',
    bgColor: 'transparent',
    borderColor: 'transparent',
    borderWidthPx: 0,
    borderRadiusPx: 0,
    paddingPx: 0,
    paddingXPx: 0,
    paddingYPx: 0,
    isLocked: false,
    isMultiline: false,
    isVisible: true,
    autoFitText: true,
    minFontSizePx: 9,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.5,
    textStrokeColor: '#000000',
  },
];

export const DEFAULT_CARD_ART: CardArtConfig = {
  imageUrl: null,
  mode: 'full-bleed',
  fit: 'cover',
  opacity: 1,
  frameTopPercent: 13,
  frameHeightPercent: 41,
  frameMarginPercent: 6,
};

export const DEFAULT_AVATAR_FRAME_URL = '/assets/frames/Avatar.png';

export const DEFAULT_CARD_FRAME: CardFrameConfig = {
  imageUrl: null,
  opacity: 1,
  fit: 'fill',
  isVisible: true,
};

/**
 * Símbolos Padrão de Exemplo (SVG Transparente)
 */
export const SAMPLE_MANA_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="manaGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="%2367e8f9"/>
      <stop offset="45%" stop-color="%230284c7"/>
      <stop offset="100%" stop-color="%230c4a6e"/>
    </radialGradient>
    <linearGradient id="manaRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23bae6fd"/>
      <stop offset="100%" stop-color="%230369a1"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="none" stroke="url(%23manaRim)" stroke-width="4"/>
  <polygon points="50,15 80,40 68,82 32,82 20,40" fill="url(%23manaGlow)" stroke="%23e0f2fe" stroke-width="2.5"/>
  <polygon points="50,22 72,42 62,75 38,75 28,42" fill="none" stroke="%23ffffff" stroke-width="1.2" opacity="0.7"/>
  <circle cx="43" cy="38" r="6" fill="%23ffffff" opacity="0.65"/>
</svg>`;

export const SAMPLE_ATTACK_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
  <defs>
    <radialGradient id="atkGlow" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stop-color="%23fca5a5"/>
      <stop offset="50%" stop-color="%23dc2626"/>
      <stop offset="100%" stop-color="%237f1d1d"/>
    </radialGradient>
    <linearGradient id="atkRim" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="%23fecaca"/>
      <stop offset="100%" stop-color="%23b91c1c"/>
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="45" fill="none" stroke="url(%23atkRim)" stroke-width="4"/>
  <!-- Espadas cruzadas de ataque -->
  <path d="M 28 72 L 72 28 M 65 24 L 76 35 M 24 65 L 35 76 M 22 78 L 26 74 M 74 26 L 78 22" stroke="%23ffffff" stroke-width="5" stroke-linecap="round"/>
  <path d="M 72 72 L 28 28 M 35 24 L 24 35 M 76 65 L 65 76 M 78 78 L 74 74 M 22 26 L 26 22" stroke="%23fecaca" stroke-width="5" stroke-linecap="round"/>
  <circle cx="50" cy="50" r="14" fill="url(%23atkGlow)" stroke="%23ffffff" stroke-width="2"/>
</svg>`;

/**
 * CONFIGURAÇÃO PADRÃO DAS IMAGENS SUPERIORES (MANA & ATAQUE)
 */
export const DEFAULT_MANA_SYMBOL: CustomSymbolConfig = {
  id: 'manaSymbol',
  name: 'Símbolo de Mana',
  imageUrl: null,
  xPercent: 5.5,
  yPercent: 4.8,
  widthPercent: 9.5,
  heightPercent: 6.8,
  keepAspectRatio: true,
  rotationDeg: 0,
  opacity: 1,
  zIndex: 25,
  isVisible: true,
};

export const DEFAULT_ATTACK_SYMBOL: CustomSymbolConfig = {
  id: 'attackSymbol',
  name: 'Símbolo de Ataque',
  imageUrl: null,
  xPercent: 85.5,
  yPercent: 4.8,
  widthPercent: 9.5,
  heightPercent: 6.8,
  keepAspectRatio: true,
  rotationDeg: 0,
  opacity: 1,
  zIndex: 25,
  isVisible: true,
};

export const DEFAULT_CARD_SYMBOLS: CardSymbolsConfig = {
  manaSymbol: DEFAULT_MANA_SYMBOL,
  attackSymbol: DEFAULT_ATTACK_SYMBOL,
};

/**
 * Exemplo de Cardframe Wireframe em SVG com transparência.
 * A área central é transparente para permitir que a ilustração de baixo apareça.
 */
export const SAMPLE_CARDFRAME_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 630 880" width="630" height="880">
  <!-- Bordas externas e moldura estilizada -->
  <rect x="15" y="15" width="600" height="850" rx="20" fill="none" stroke="%23334155" stroke-width="8"/>
  <rect x="25" y="25" width="580" height="830" rx="14" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-dasharray="8 6"/>

  <!-- Barra do Nome Superior -->
  <rect x="34" y="38" width="562" height="66" rx="10" fill="%23f8fafc" fill-opacity="0.9" stroke="%2364748b" stroke-width="3"/>
  <circle cx="560" cy="71" r="22" fill="%23e2e8f0" stroke="%2364748b" stroke-width="3"/>

  <!-- Janela de Ilustração com Recorte Transparente (área vazada para a arte aparecer) -->
  <rect x="36" y="114" width="558" height="364" rx="8" fill="none" stroke="%23475569" stroke-width="5"/>
  <rect x="42" y="120" width="546" height="352" rx="4" fill="none" stroke="%23cbd5e1" stroke-width="2"/>

  <!-- Faixa de Tipo / Subtipo -->
  <rect x="36" y="488" width="558" height="46" rx="6" fill="%23f1f5f9" fill-opacity="0.95" stroke="%2364748b" stroke-width="3"/>

  <!-- Caixa de Texto / Regras Inferior -->
  <rect x="36" y="546" width="558" height="212" rx="10" fill="%23ffffff" fill-opacity="0.92" stroke="%2364748b" stroke-width="3"/>
  <line x1="56" y1="616" x2="574" y2="616" stroke="%23e2e8f0" stroke-width="1.5" stroke-dasharray="4 4"/>
  <line x1="56" y1="670" x2="574" y2="670" stroke="%23e2e8f0" stroke-width="1.5" stroke-dasharray="4 4"/>

  <!-- Caixa de Atributos (Ataque/Defesa) no Canto Inferior -->
  <rect x="440" y="768" width="154" height="68" rx="12" fill="%230f172a" stroke="%23e2e8f0" stroke-width="4"/>
  
  <!-- Detalhes de Canto Ornamentais (Wireframe) -->
  <path d="M 25 60 L 60 25 M 605 60 L 570 25 M 25 820 L 60 855 M 605 820 L 570 855" stroke="%2364748b" stroke-width="2"/>
</svg>`;

/**
 * Exemplo de Cardframe Horizontal Wireframe para cartas Site em SVG (880 × 660).
 */
export const SAMPLE_SITE_CARDFRAME_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 660" width="880" height="660">
  <!-- Bordas externas e moldura estilizada horizontal -->
  <rect x="15" y="15" width="850" height="630" rx="20" fill="none" stroke="%23334155" stroke-width="8"/>
  <rect x="25" y="25" width="830" height="610" rx="14" fill="none" stroke="%2394a3b8" stroke-width="2" stroke-dasharray="8 6"/>

  <!-- Barra do Nome Superior Horizontal -->
  <rect x="140" y="20" width="580" height="54" rx="10" fill="%23f8fafc" fill-opacity="0.9" stroke="%2364748b" stroke-width="3"/>

  <!-- Janela de Ilustração Central com Recorte Transparente -->
  <rect x="36" y="80" width="808" height="326" rx="8" fill="none" stroke="%23475569" stroke-width="5"/>
  <rect x="42" y="86" width="796" height="314" rx="4" fill="none" stroke="%23cbd5e1" stroke-width="2"/>

  <!-- Faixa de Tipo / Subtipo -->
  <rect x="36" y="416" width="808" height="38" rx="6" fill="%23f1f5f9" fill-opacity="0.95" stroke="%2364748b" stroke-width="3"/>

  <!-- Caixa de Regras / Descrição Inferior -->
  <rect x="36" y="462" width="808" height="142" rx="10" fill="%23ffffff" fill-opacity="0.92" stroke="%2364748b" stroke-width="3"/>
  <line x1="56" y1="515" x2="824" y2="515" stroke="%23e2e8f0" stroke-width="1.5" stroke-dasharray="4 4"/>
  <line x1="56" y1="560" x2="824" y2="560" stroke="%23e2e8f0" stroke-width="1.5" stroke-dasharray="4 4"/>

  <!-- Detalhes de Canto Ornamentais (Wireframe Horizontal) -->
  <path d="M 25 60 L 60 25 M 855 60 L 820 25 M 25 600 L 60 635 M 855 600 L 820 635" stroke="%2364748b" stroke-width="2"/>
</svg>`;

/**
 * PRESETS INICIAIS DE CAIXAS DE TEXTO PARA A CARTA SITE (HORIZONTAL 88 × 66 mm)
 * Reutiliza os mesmos estilos, fontes e funções da Minion, adaptados para o formato paisagem.
 */
export const DEFAULT_SITE_TEXT_BOXES: TextBoxConfig[] = [
  {
    id: 'box-title',
    role: 'title',
    name: 'Nome da Carta',
    content: 'Troll Bridge',
    xPercent: 7.9,
    yPercent: 83.3,
    widthPercent: 83.0,
    heightPercent: 7.8,
    fontSizePx: 17,
    fontWeight: 'bold',
    fontFamily: 'fantaisie-artistique',
    textAlign: 'center',
    textColor: '#d8d4d4',
    bgColor: 'transparent',
    borderColor: '#cbd5e1',
    borderWidthPx: 0,
    borderRadiusPx: 6,
    paddingPx: 0,
    paddingXPx: 0,
    paddingYPx: 0,
    isLocked: false,
    isMultiline: false,
    isVisible: true,
    autoFitText: true,
    minFontSizePx: 8,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.8,
    textStrokeColor: '#000000',
  },
  {
    id: 'box-type',
    role: 'type',
    name: 'Tipo / Subtipo',
    content: 'An Exceptional Site to traipse atop',
    xPercent: 16.0,
    yPercent: 3.6,
    widthPercent: 63.0,
    heightPercent: 7.8,
    fontSizePx: 13,
    fontWeight: 'bold',
    fontFamily: 'fantaisie-artistique',
    textAlign: 'center',
    textColor: '#e2dada',
    bgColor: 'transparent',
    borderColor: '#e2e8f0',
    borderWidthPx: 0,
    borderRadiusPx: 4,
    paddingPx: 0,
    paddingXPx: 0,
    paddingYPx: 0,
    isLocked: false,
    isMultiline: false,
    isVisible: true,
    autoFitText: true,
    minFontSizePx: 7,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.8,
    textStrokeColor: '#000000',
  },
  {
    id: 'box-description',
    role: 'rules',
    name: 'Caixa de Regras / Descrição',
    content: '',
    xPercent: 9.0,
    yPercent: 88.1,
    widthPercent: 81.0,
    heightPercent: 8.0,
    fontSizePx: 12,
    fontWeight: 'normal',
    fontFamily: 'book-antiqua',
    textAlign: 'left',
    textColor: '#000000',
    bgColor: 'transparent',
    borderColor: '#cbd5e1',
    borderWidthPx: 0,
    borderRadiusPx: 6,
    paddingPx: 8,
    paddingXPx: 10,
    paddingYPx: 6,
    isLocked: false,
    isMultiline: true,
    isVisible: true,
    autoFitText: true,
    minFontSizePx: 4,
    letterSpacingPx: -0.5,
    paragraphSpacingPx: 2,
    lineHeight: 1.35,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.1,
    textStrokeColor: '#000000',
  },
  {
    id: 'box-footer',
    role: 'footer',
    name: 'Rodapé / Numeração',
    content: 'art @ Vicent Pompetti',
    xPercent: 8.0,
    yPercent: 93.0,
    widthPercent: 84.0,
    heightPercent: 4.5,
    fontSizePx: 12,
    fontWeight: 'normal',
    fontFamily: 'palatino-italic',
    textAlign: 'center',
    textColor: '#ffffff',
    bgColor: 'transparent',
    borderColor: 'transparent',
    borderWidthPx: 0,
    borderRadiusPx: 0,
    paddingPx: 0,
    paddingXPx: 0,
    paddingYPx: 0,
    isLocked: false,
    isMultiline: false,
    isVisible: true,
    autoFitText: true,
    minFontSizePx: 8,
    textStrokeEnabled: true,
    textStrokeWidthPx: 0.5,
    textStrokeColor: '#000000',
  },
];

export const DEFAULT_MINION_TEXT_BOXES: TextBoxConfig[] = DEFAULT_TCG_TEXT_BOXES;

export const DEFAULT_MAGIC_TEXT_BOXES: TextBoxConfig[] = [
  {
    ...DEFAULT_TCG_TEXT_BOXES[0],
    content: 'Vórtice Arcano',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[1],
    content: 'Ordinary Magic',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[2],
    content: 'Conjura uma onda arcana pelo reino.',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[3],
    content: 'art @ Vicent Pompetti',
  },
];

export const DEFAULT_AURA_TEXT_BOXES: TextBoxConfig[] = [
  {
    ...DEFAULT_TCG_TEXT_BOXES[0],
    content: 'Santuário da Aurora',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[1],
    content: 'Continuous Aura',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[2],
    content: 'Enquanto esta aura persistir, aliados no local recebem bênção primordial.',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[3],
    content: 'art @ Vicent Pompetti',
  },
];

export const DEFAULT_ARTIFACT_TEXT_BOXES: TextBoxConfig[] = [
  {
    ...DEFAULT_TCG_TEXT_BOXES[0],
    content: 'Cálice Primordial',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[1],
    content: 'Artifact • Relic',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[2],
    content: 'Canalize a essência dos elementos ancestrais.',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[3],
    content: 'art @ Vicent Pompetti',
  },
];

export const DEFAULT_AVATAR_TEXT_BOXES: TextBoxConfig[] = [
  {
    ...DEFAULT_TCG_TEXT_BOXES[0],
    content: 'Arquimago Primordial',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[1],
    content: 'Avatar',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[2],
    content: 'Comanda as forças do reino e conjura seus lacaios ao campo de batalha.',
  },
  {
    ...DEFAULT_TCG_TEXT_BOXES[3],
    content: 'art @ Vicent Pompetti',
  },
];

export function getDefaultTextBoxesForType(cardType?: import('../types/cardType').CardTypeId | null): TextBoxConfig[] {
  let source: TextBoxConfig[];
  switch (cardType) {
    case 'site':
      source = DEFAULT_SITE_TEXT_BOXES;
      break;
    case 'magic':
      source = DEFAULT_MAGIC_TEXT_BOXES;
      break;
    case 'aura':
      source = DEFAULT_AURA_TEXT_BOXES;
      break;
    case 'artifact':
      source = DEFAULT_ARTIFACT_TEXT_BOXES;
      break;
    case 'avatar':
      source = DEFAULT_AVATAR_TEXT_BOXES;
      break;
    case 'minion':
    default:
      source = DEFAULT_TCG_TEXT_BOXES;
      break;
  }
  // Sempre retorna uma cópia profunda para garantir isolamento e independência total de referência
  return JSON.parse(JSON.stringify(source));
}

