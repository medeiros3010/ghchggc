import { TextBoxConfig } from '../types/card';
import { getFontCssProperties } from './fontHelper';

export interface TextFitResult {
  effectiveFontSizePx: number;
  isReduced: boolean;
  isOverflowing: boolean; // True se mesmo no tamanho mínimo a caixa ainda não comporta todo o texto
  scaleFactor: number;
}

let measureCanvas: HTMLCanvasElement | null = null;
let measureCtx: CanvasRenderingContext2D | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === 'undefined') return null;
  if (!measureCanvas) {
    measureCanvas = document.createElement('canvas');
    measureCanvas.width = 1600;
    measureCanvas.height = 1600;
    measureCtx = measureCanvas.getContext('2d');
  }
  return measureCtx;
}

/**
 * Verifica se o texto de uma caixa cabe perfeitamente dentro de suas dimensões
 * (largura e altura limites), considerando quebras de linha, entrelinha (line-height),
 * espaçamento entre parágrafos, letter-spacing, word-spacing, contorno e margens internas (padding).
 */
export function checkTextFits(
  box: TextBoxConfig,
  fontSize: number,
  cardWidthPx: number = 360,
  cardHeightPx: number = 360 / (63 / 88)
): boolean {
  const ctx = getMeasureContext();
  if (!ctx) return true;

  const fontCss = getFontCssProperties(box.fontFamily);
  const fontSpec = `${fontCss.fontStyle} ${box.fontWeight || 'normal'} ${fontSize}px ${fontCss.fontFamily}`;
  ctx.font = fontSpec;

  const letterSpacing = box.letterSpacingPx || 0;
  const wordSpacing = box.wordSpacingPx || 0;
  if ('letterSpacing' in ctx) {
    (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpacing}px`;
  }
  if ('wordSpacing' in ctx) {
    (ctx as unknown as { wordSpacing: string }).wordSpacing = `${wordSpacing}px`;
  }

  // Dimensões da caixa em pixels na escala de referência
  const boxWidthPx = (box.widthPercent / 100) * cardWidthPx;
  const padX = box.paddingXPx !== undefined ? box.paddingXPx : (box.paddingPx ?? 0);
  const padY = box.paddingYPx !== undefined ? box.paddingYPx : (box.paddingPx ?? 0);

  const strokeWidth = box.textStrokeEnabled ? (box.textStrokeWidthPx || 0) : 0;
  // Margem de segurança para contorno das letras
  const maxAllowedW = Math.max(4, boxWidthPx - padX * 2 - strokeWidth);

  const hasMaxH = box.heightPercent && box.heightPercent > 0;
  const boxHeightPx = hasMaxH ? (box.heightPercent! / 100) * cardHeightPx : Infinity;
  const maxAllowedH = hasMaxH ? Math.max(4, boxHeightPx - padY * 2 - strokeWidth) : Infinity;

  const effectiveLineHeight = box.lineHeight !== undefined ? box.lineHeight : 1.25;
  const lineHeightPx = fontSize * effectiveLineHeight;
  const paragraphSpacingPx = box.paragraphSpacingPx !== undefined ? box.paragraphSpacingPx : 4;

  const content = box.content || '';
  if (!content.trim()) return true;

  // Linha Única
  if (!box.isMultiline) {
    const width = ctx.measureText(content).width;
    const height = lineHeightPx;
    return width <= maxAllowedW && height <= maxAllowedH;
  }

  // Múltiplas Linhas
  const paragraphs = content.split(/\r?\n/);
  let totalH = 0;

  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    if (!para.trim()) {
      totalH += lineHeightPx;
      if (p < paragraphs.length - 1) totalH += paragraphSpacingPx;
      if (totalH > maxAllowedH) return false;
      continue;
    }

    const words = para.split(' ');
    let currentLine = '';

    for (let w = 0; w < words.length; w++) {
      const word = words[w];
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

      if (metrics.width > maxAllowedW && currentLine) {
        // A palavra quebra para a linha seguinte
        // Verifica se a palavra sozinha excede a largura total da caixa
        if (ctx.measureText(word).width > maxAllowedW) {
          return false;
        }
        totalH += lineHeightPx;
        if (totalH > maxAllowedH) return false;
        currentLine = word;
      } else if (metrics.width > maxAllowedW && !currentLine) {
        // Uma palavra isolada é mais larga do que a largura permitida
        return false;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      totalH += lineHeightPx;
      if (totalH > maxAllowedH) return false;
    }

    if (p < paragraphs.length - 1) {
      totalH += paragraphSpacingPx;
      if (totalH > maxAllowedH) return false;
    }
  }

  return totalH <= maxAllowedH;
}

/**
 * Calcula o tamanho efetivo de exibição para a caixa de texto respeitando a configuração de Auto Fit.
 *
 * Regras implementadas:
 * 1. Não altera permanentemente o fontSizePx base configurado pelo usuário.
 * 2. Se o texto já cabe no tamanho base (ou autoFitText estiver desativado), mantém o tamanho original.
 * 3. Se o texto excede os limites, reduz proporcionalmente até que todo o conteúdo caiba.
 * 4. Respeita o tamanho mínimo configurado (minFontSizePx).
 * 5. Se mesmo no mínimo o texto ainda não couber, retorna isOverflowing = true para exibição de alerta.
 */
export function calculateAutoFitFontSize(
  box: TextBoxConfig,
  cardWidthPx: number = 360,
  cardHeightPx: number = 360 / (63 / 88)
): TextFitResult {
  const isAutoFit = box.autoFitText ?? true;
  const baseFontSize = box.fontSizePx || 14;
  const minFontSize = box.minFontSizePx !== undefined ? box.minFontSizePx : 8;

  // Se auto-fit estiver desativado, usa o tamanho base original
  if (!isAutoFit) {
    const fits = checkTextFits(box, baseFontSize, cardWidthPx, cardHeightPx);
    return {
      effectiveFontSizePx: baseFontSize,
      isReduced: false,
      isOverflowing: !fits,
      scaleFactor: 1.0,
    };
  }

  // Se já cabe no tamanho base, mantém o tamanho original sem reduzir
  if (checkTextFits(box, baseFontSize, cardWidthPx, cardHeightPx)) {
    return {
      effectiveFontSizePx: baseFontSize,
      isReduced: false,
      isOverflowing: false,
      scaleFactor: 1.0,
    };
  }

  // Busca binária com passo de 0.25px entre minFontSize e baseFontSize
  let low = minFontSize;
  let high = baseFontSize;
  let best = minFontSize;

  for (let i = 0; i < 9; i++) {
    const mid = Math.round(((low + high) / 2) * 4) / 4;
    if (checkTextFits(box, mid, cardWidthPx, cardHeightPx)) {
      best = mid;
      low = mid + 0.25; // Tenta aumentar
    } else {
      high = mid - 0.25; // Precisa diminuir
    }
  }

  const fitsAtMin = checkTextFits(box, minFontSize, cardWidthPx, cardHeightPx);

  return {
    effectiveFontSizePx: best,
    isReduced: best < baseFontSize,
    isOverflowing: !fitsAtMin,
    scaleFactor: best / baseFontSize,
  };
}
