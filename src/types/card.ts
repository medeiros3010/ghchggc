/**
 * CONFIGURAÇÃO DE DIMENSÕES DA CARTA (Card Dimensions)
 * 
 * Uma carta padrão de TCG / Colecionável (Magic, Pokémon, etc.) possui:
 * - 63mm x 88mm (2.48 x 3.46 polegadas ≈ 2.5 x 3.5 polegadas)
 * - Proporção de aspecto: 63 / 88 = 0.7159
 * 
 * Se você desejar outro formato no futuro (ex: Mini American 41x63mm, Tarot 70x120mm, Bridge 57x89mm),
 * altere os valores abaixo em CARD_DIMENSIONS_CONFIG.
 */
export interface CardDimensionsConfig {
  name: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  borderRadiusPx: number;
}

export const CARD_PRESETS: Record<string, CardDimensionsConfig> = {
  standardTCG: {
    name: 'Padrão Sorcery (63mm × 88mm)',
    widthMm: 63,
    heightMm: 88,
    aspectRatio: 63 / 88, // ~0.715909
    borderRadiusPx: 18,
  },
  minion: {
    name: 'Minion (63mm × 88mm)',
    widthMm: 63,
    heightMm: 88,
    aspectRatio: 63 / 88,
    borderRadiusPx: 18,
  },
  site: {
    name: 'Site (88mm × 63mm)',
    widthMm: 88,
    heightMm: 63,
    aspectRatio: 88 / 63, // ~1.396825
    borderRadiusPx: 18,
  },
  magic: {
    name: 'Magic (63mm × 88mm)',
    widthMm: 63,
    heightMm: 88,
    aspectRatio: 63 / 88,
    borderRadiusPx: 18,
  },
  aura: {
    name: 'Aura (63mm × 88mm)',
    widthMm: 63,
    heightMm: 88,
    aspectRatio: 63 / 88,
    borderRadiusPx: 18,
  },
  artifact: {
    name: 'Artifact (63mm × 88mm)',
    widthMm: 63,
    heightMm: 88,
    aspectRatio: 63 / 88,
    borderRadiusPx: 18,
  },
  avatar: {
    name: 'Avatar (63mm × 88mm)',
    widthMm: 63,
    heightMm: 88,
    aspectRatio: 63 / 88,
    borderRadiusPx: 18,
  },
  bridge: {
    name: 'Bridge (57mm × 89mm)',
    widthMm: 57,
    heightMm: 89,
    aspectRatio: 57 / 89,
    borderRadiusPx: 16,
  },
  tarot: {
    name: 'Tarot (70mm × 120mm)',
    widthMm: 70,
    heightMm: 120,
    aspectRatio: 70 / 120,
    borderRadiusPx: 20,
  },
  square: {
    name: 'Quadrada (70mm × 70mm)',
    widthMm: 70,
    heightMm: 70,
    aspectRatio: 1,
    borderRadiusPx: 16,
  },
};

/**
 * Dimensão física e proporção padrão global de cartas Sorcery: Contested Realm.
 * 63mm x 88mm (proporção ~0.7159) com acabamento suave e refinado nos 4 cantos externos (~3.15mm).
 */
export const SORCERY_CARD_DIMENSIONS: CardDimensionsConfig = CARD_PRESETS.standardTCG;

export function getCardDimensionsForType(cardType?: import('./cardType').CardTypeId | null): CardDimensionsConfig {
  if (cardType === 'site') {
    return CARD_PRESETS.site;
  }
  return SORCERY_CARD_DIMENSIONS;
}

/**
 * CONFIGURAÇÃO DAS CAIXAS DE TEXTO (Dynamic Text Boxes)
 * As posições (x, y, width, height) são expressas em PORCENTAGEM (%) da carta,
 * permitindo que a carta seja redimensionada na tela ou impressa em alta resolução
 * sem perder o alinhamento das caixas.
 */
export type FontFamilyType =
  | 'morpheus'
  | 'fantaisie-artistique'
  | 'palatino'
  | 'palatino-italic'
  | 'book-antiqua'
  | 'book-antiqua-italic'
  | 'sans'
  | 'serif'
  | 'mono';

export type TextBoxRole = 'title' | 'type' | 'rules' | 'footer';

export interface TextBoxRoleMapping {
  role: TextBoxRole;
  label: string;
  defaultId: string;
  description: string;
}

export const TEXT_BOX_ROLES: TextBoxRoleMapping[] = [
  { role: 'title', label: 'Nome da Carta', defaultId: 'box-title', description: 'Título principal da carta' },
  { role: 'type', label: 'Tipo / Subtipo', defaultId: 'box-type', description: 'Classificação e linhagem' },
  { role: 'rules', label: 'Regras / Descrição', defaultId: 'box-description', description: 'Caixa de texto de regras e habilidades' },
  { role: 'footer', label: 'Rodapé / Numeração', defaultId: 'box-footer', description: 'Créditos de arte e numeração de coleção' },
];

export function findBoxByRole(boxes: TextBoxConfig[], role: TextBoxRole): TextBoxConfig | undefined {
  // 1. Verificação por role explícito
  const byRole = boxes.find((b) => b.role === role);
  if (byRole) return byRole;

  // 2. Mapeamento por ID estável padrão
  const defaultMapping = TEXT_BOX_ROLES.find((m) => m.role === role);
  if (defaultMapping) {
    const byId = boxes.find((b) => b.id === defaultMapping.defaultId);
    if (byId) return byId;
  }

  // 3. Fallback semântico pelo nome ou ID
  switch (role) {
    case 'title':
      return boxes.find((b) => b.name.toLowerCase().includes('nome') || b.id.includes('title'));
    case 'type':
      return boxes.find((b) => b.name.toLowerCase().includes('tipo') || b.id.includes('type'));
    case 'rules':
      return boxes.find(
        (b) =>
          b.name.toLowerCase().includes('regra') ||
          b.name.toLowerCase().includes('descri') ||
          b.id.includes('desc')
      );
    case 'footer':
      return boxes.find(
        (b) =>
          b.name.toLowerCase().includes('roda') ||
          b.name.toLowerCase().includes('num') ||
          b.id.includes('footer')
      );
    default:
      return undefined;
  }
}

/**
 * Determina se uma caixa de texto é do tipo Regras/Descrição.
 * O botão de Símbolos deve aparecer EXCLUSIVAMENTE em caixas com essa função.
 */
export function isRulesTextBox(box?: TextBoxConfig | null): boolean {
  if (!box) return false;
  // 1. Role explícito de regras
  if (box.role === 'rules') return true;
  // 2. Se possuir explicitamente outro role principal, não é regras
  if (box.role === 'title' || box.role === 'type' || box.role === 'footer') return false;
  
  const idLower = (box.id || '').toLowerCase();
  const nameLower = (box.name || '').toLowerCase();

  // 3. Identificador padrão ou descritivo
  if (idLower === 'box-description' || idLower.includes('rule') || idLower.includes('desc')) return true;

  // 4. Fallback semântico por nome do rótulo
  if (
    nameLower.includes('regra') ||
    nameLower.includes('descri') ||
    nameLower.includes('efeito') ||
    nameLower.includes('habilidade') ||
    nameLower.includes('texto de regra')
  ) {
    return true;
  }

  return false;
}

export interface TextBoxConfig {
  id: string;
  role?: TextBoxRole; // Função estável no layout da carta (title, type, rules, footer)
  name: string; // Rótulo identificador (ex: "Nome da Carta", "Descrição", "Atributos")
  content: string; // O texto digitado pelo usuário
  xPercent: number; // Posição horizontal (0% a 100%)
  yPercent: number; // Posição vertical (0% a 100%)
  widthPercent: number; // Largura relativa da caixa
  heightPercent?: number; // Altura mínima relativa (opcional)
  fontSizePx: number; // Tamanho base da fonte
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'black';
  fontFamily: FontFamilyType;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  textColor: string;
  bgColor: string; // Cor de fundo (ex: rgba(255, 255, 255, 0.85) ou 'transparent')
  borderColor: string;
  borderWidthPx: number;
  borderRadiusPx: number;
  // CONTROLES DE MARGEM INTERNA INDEPENDENTE (PADDING)
  paddingPx: number; // Margem interna padrão (mantida para compatibilidade)
  paddingXPx?: number; // Margem horizontal independente (0px a 30px, padrão paddingPx)
  paddingYPx?: number; // Margem vertical independente (0px a 30px, padrão paddingPx)

  isLocked: boolean; // Se travada, não permite arrastar na tela acidentalmente
  isMultiline: boolean;
  isVisible: boolean;

  // CONTROLES AVANÇADOS DE ESPAÇAMENTO TIPOGRÁFICO
  letterSpacingPx?: number; // Espaçamento entre letras (-4px a 15px, padrão 0)
  wordSpacingPx?: number; // Espaçamento entre palavras (-5px a 25px, padrão 0)
  lineHeight?: number; // Altura da linha / Entrelinha (0.5 a 3.0, padrão 1.25)
  paragraphSpacingPx?: number; // Espaçamento entre parágrafos (0px a 30px, padrão 4)

  // ALINHAMENTO INDIVIDUAL POR PARÁGRAFO / LINHA
  paragraphAlignments?: ('left' | 'center' | 'right' | 'justify')[]; // Alinhamentos específicos por índice de parágrafo (0 = 1º parágrafo, 1 = 2º, etc.). Se não definido, usa textAlign geral.

  // REDIMENSIONAMENTO AUTOMÁTICO DA FONTE (AUTO FIT)
  autoFitText?: boolean; // Se ativado, reduz automaticamente a fonte até que o texto caiba na caixa (padrão true para novas caixas)
  minFontSizePx?: number; // Tamanho mínimo de fonte permitido para redução automática (padrão 8px)

  // CONTROLES DE CONTORNO DAS LETRAS (TEXT OUTLINE / STROKE)
  textStrokeEnabled?: boolean; // Ativa/desativa o contorno nas letras (não na borda da caixa)
  textStrokeColor?: string; // Cor independente do contorno das letras
  textStrokeWidthPx?: number; // Espessura do contorno em pixels (permite decimais ex: 0.5, 1.2, 2.5)
}

/**
 * CONFIGURAÇÃO DA ARTE FRONTAL (Camada de Baixo)
 */
export interface CardArtConfig {
  imageUrl: string | null;
  mode: 'full-bleed' | 'framed'; // 'full-bleed' ocupa a carta toda, 'framed' ocupa área delimitada
  fit: 'cover' | 'contain' | 'fill';
  opacity: number; // 0 a 1
  frameTopPercent: number; // se modo framed: início do frame
  frameHeightPercent: number; // altura do frame de arte
  frameMarginPercent: number; // margem lateral do frame
}

/**
 * CONFIGURAÇÃO DO CARDFRAME / MOLDURA FRONTAL (Camada Intermediária)
 * Fica posicionada SOBRE a arte da carta e ABAIXO das caixas de texto.
 * Geralmente uma imagem PNG transparente com as bordas, ornamentos e caixas de visualização recortadas.
 */
export interface CardFrameConfig {
  imageUrl: string | null;
  opacity: number; // 0 a 1
  fit: 'cover' | 'contain' | 'fill';
  isVisible: boolean;
}

/**
 * CONFIGURAÇÃO DE IMAGENS/SÍMBOLOS PERSONALIZADOS SUPERIORES
 * Símbolo 1: Mana (canto superior esquerdo)
 * Símbolo 2: Ataque (canto superior direito)
 * Camadas independentes sobre o Cardframe e arrastáveis/redimensionáveis.
 */
export interface CustomSymbolConfig {
  id: 'manaSymbol' | 'attackSymbol';
  name: string;
  imageUrl: string | null;
  xPercent: number; // Posição horizontal na carta (0% a 100%)
  yPercent: number; // Posição vertical na carta (0% a 100%)
  widthPercent: number; // Largura relativa na carta
  heightPercent: number; // Altura relativa na carta
  keepAspectRatio: boolean; // Manter proporção original (1:1 ou proporção nativa)
  rotationDeg: number; // Rotação em graus (0° a 360°)
  opacity: number; // Opacidade (0 a 1)
  zIndex: number; // Ordem de sobreposição
  isVisible: boolean;
}

export interface CardSymbolsConfig {
  manaSymbol: CustomSymbolConfig;
  attackSymbol: CustomSymbolConfig;
}

/**
 * ESTADO COMPLETO E ISOLADO DE UM TIPO DE CARTA
 * Garante independência visual e de conteúdo total para cada tipo de carta.
 */
export interface CardTypeState {
  cardType: import('./cardType').CardTypeId;
  selectedAttribute?: import('./cardAttribute').CardAttributeId;
  dimensions: CardDimensionsConfig;
  artConfig: CardArtConfig;
  frameConfig: CardFrameConfig;
  symbolsConfig: CardSymbolsConfig;
  textBoxes: TextBoxConfig[];
  sorceryConfig: import('./sorcery').SorceryIndicatorsConfig;
}

export * from './cardType';
export * from './cardAttribute';




