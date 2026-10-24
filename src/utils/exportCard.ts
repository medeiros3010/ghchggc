import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  TextBoxConfig,
} from '../types/card';
import {
  SorceryIndicatorsConfig,
  computeThresholdDistribution,
  getCombatMode,
  DEFAULT_ATTACK_STYLE,
  DEFAULT_DEFENSE_STYLE,
  SORCERY_ELEMENTS,
  getThresholdElementImagePath,
} from '../types/sorcery';
import { ensureAllFontsLoaded, getCanvasFontSpec, AVAILABLE_FONTS } from './fontHelper';
import { calculateAutoFitFontSize } from './textFit';
import { hasCombatAttributes } from '../types/cardType';
import {
  CardAttributeId,
  getAllowedThresholdElements,
  findAttributeByFrameUrl,
} from '../types/cardAttribute';
import { parseTextWithSymbols, ParsedTextChunk, THRESHOLD_IMAGE_MAP } from './textSymbols';

/**
 * Utilitário para renderizar e exportar a carta em formato PNG de alta resolução
 * através da API HTML5 Canvas, mantendo a proporção exata de 63mm x 88mm (ou o preset ativo).
 */
export async function exportCardToPng(
  dimensions: CardDimensionsConfig,
  artConfig: CardArtConfig,
  frameConfig: CardFrameConfig,
  textBoxes: TextBoxConfig[],
  symbolsConfig?: CardSymbolsConfig,
  fileName = 'carta-wireframe.png',
  sorceryConfig?: SorceryIndicatorsConfig,
  cardType?: import('../types/cardType').CardTypeId | null,
  selectedAttribute?: CardAttributeId
): Promise<void> {
  // Aguarda o carregamento e rasterização completa de todas as fontes antes de renderizar
  await ensureAllFontsLoaded();

  // Pré-carrega ícones de símbolos de Threshold para renderização inline em texto
  const symbolImages: Record<string, HTMLImageElement> = {};
  await Promise.all(
    Object.entries(THRESHOLD_IMAGE_MAP).map(async ([key, url]) => {
      try {
        symbolImages[key] = await loadImage(url);
      } catch (err) {
        console.warn(`Erro ao carregar imagem de símbolo ${url}:`, err);
      }
    })
  );

  // Resolução de exportação de alta fidelidade (~308 DPI):
  // Proporção física oficial de Sorcery:
  // Vertical (63mm × 88mm): 800 × 1117 pixels (proporção exata 63/88)
  // Horizontal Site (88mm × 63mm): 1117 × 800 pixels (proporção exata 88/63)
  const isLandscape = dimensions.widthMm > dimensions.heightMm;
  const targetWidth = isLandscape ? 1117 : 800;
  const targetHeight = isLandscape ? 800 : Math.round(800 / dimensions.aspectRatio);

  const previewWidth = isLandscape ? 503 : 360;
  const previewHeight = isLandscape ? 360 : Math.round(360 / dimensions.aspectRatio);
  const scale = targetWidth / previewWidth;

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Recorte arredondado proporcional e limpo nos 4 cantos externos da carta (TCG Die-cut)
  // Mantém os cantos externos transparentes no arquivo PNG, sem bordas brancas ou fundos artificiais
  const cornerRadius = (dimensions.borderRadiusPx || 18) * scale;
  ctx.save();
  roundRect(ctx, 0, 0, targetWidth, targetHeight, cornerRadius);
  ctx.clip();

  // 1. Fundo da Carta (Wireframe limpo no interior do recorte arredondado)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, targetWidth, targetHeight);

  // 2. Renderizar Imagem de Arte (Camada Inferior)
  if (artConfig.imageUrl) {
    try {
      const img = await loadImage(artConfig.imageUrl);
      ctx.save();
      ctx.globalAlpha = artConfig.opacity;

      const artScale = artConfig.scale ?? 1.0;
      const artOffsetX = artConfig.offsetXPercent ?? 0;
      const artOffsetY = artConfig.offsetYPercent ?? 0;

      if (artConfig.mode === 'full-bleed') {
        // Modo Sangria Total / Full Bleed
        drawCoverImage(ctx, img, 0, 0, targetWidth, targetHeight, artConfig.fit, artScale, artOffsetX, artOffsetY);
      } else {
        // Modo Moldura Designada de Arte
        const frameX = (artConfig.frameMarginPercent / 100) * targetWidth;
        const frameY = (artConfig.frameTopPercent / 100) * targetHeight;
        const frameW = ((100 - artConfig.frameMarginPercent * 2) / 100) * targetWidth;
        const frameH = (artConfig.frameHeightPercent / 100) * targetHeight;

        // Clip no retângulo da moldura
        ctx.save();
        ctx.beginPath();
        ctx.rect(frameX, frameY, frameW, frameH);
        ctx.clip();
        drawCoverImage(ctx, img, frameX, frameY, frameW, frameH, artConfig.fit, artScale, artOffsetX, artOffsetY);
        ctx.restore();

        // Moldura wireframe ao redor da arte (apenas se não houver cardframe carregado)
        if (!frameConfig?.imageUrl) {
          ctx.strokeStyle = '#94a3b8';
          ctx.lineWidth = 2;
          ctx.strokeRect(frameX, frameY, frameW, frameH);
        }
      }
      ctx.restore();
    } catch {
      // Caso a imagem de arte falhe ao carregar
    }
  } else if (artConfig.mode === 'framed') {
    // Espaço reservado para a arte (wireframe)
    const frameX = (artConfig.frameMarginPercent / 100) * targetWidth;
    const frameY = (artConfig.frameTopPercent / 100) * targetHeight;
    const frameW = ((100 - artConfig.frameMarginPercent * 2) / 100) * targetWidth;
    const frameH = (artConfig.frameHeightPercent / 100) * targetHeight;

    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(frameX, frameY, frameW, frameH);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.strokeRect(frameX, frameY, frameW, frameH);
    ctx.setLineDash([]);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Área Designada para Arte Frontal', frameX + frameW / 2, frameY + frameH / 2);
  }

  // 3. Renderizar CARDFRAME (Camada Intermediária - Fica por cima da arte e abaixo dos textos)
  if (frameConfig?.imageUrl && frameConfig.isVisible) {
    try {
      const frameImg = await loadImage(frameConfig.imageUrl);
      ctx.save();
      ctx.globalAlpha = frameConfig.opacity;
      if (frameConfig.fit === 'fill') {
        ctx.drawImage(frameImg, 0, 0, targetWidth, targetHeight);
      } else {
        drawCoverImage(ctx, frameImg, 0, 0, targetWidth, targetHeight, frameConfig.fit);
      }
      ctx.restore();
    } catch {
      // Caso a imagem do cardframe falhe
    }
  }

  // 4A. Renderizar Indicador Fixo de Mana Sorcery / Vida no Avatar (Site não possui custo de Mana)
  if (cardType !== 'site') {
    const isAvatar = cardType === 'avatar';
    const attrConfig = isAvatar ? (sorceryConfig?.vida || sorceryConfig?.mana) : sorceryConfig?.mana;
    if (attrConfig && attrConfig.isVisible) {
      try {
        const iconSrc = isAvatar
          ? (attrConfig.imageUrl || '/assets/sorcery/vida(1).png')
          : (attrConfig.imageUrl || '/assets/sorcery/mana.png?v=2');
        const manaImg = await loadImage(iconSrc);
        const manaScale = attrConfig.scale || 1.0;
        const baseMx = (attrConfig.xPercent / 100) * targetWidth;
        const baseMy = (attrConfig.yPercent / 100) * targetHeight;
        const baseMw = (attrConfig.widthPercent / 100) * targetWidth;
        const baseMh = (attrConfig.heightPercent / 100) * targetHeight;

        // Transformação proporcional com ponto de ancoragem no centro (transform-origin: center center)
        const centerX = baseMx + baseMw / 2;
        const centerY = baseMy + baseMh / 2;
        const scaledMw = baseMw * manaScale;
        const scaledMh = baseMh * manaScale;
        const scaledMx = centerX - scaledMw / 2;
        const scaledMy = centerY - scaledMh / 2;

        ctx.save();
        ctx.globalAlpha = attrConfig.opacity;
        if (attrConfig.keepAspectRatio) {
          drawCoverImage(ctx, manaImg, scaledMx, scaledMy, scaledMw, scaledMh, 'contain');
        } else {
          ctx.drawImage(manaImg, scaledMx, scaledMy, scaledMw, scaledMh);
        }

        // Desenhar o número de Mana / Vida centralizado sobre a esfera/gota
        const numStr = String(attrConfig.quantity ?? (isAvatar ? 20 : 0));
        const fontSize = Math.max(8, Math.round((attrConfig.fontSizePx || 20) * scale * manaScale));
        const fontDef = AVAILABLE_FONTS.find((f) => f.id === attrConfig.fontFamily);
        const cssFontFamily = fontDef ? fontDef.cssFamily : "'Morpheus', Georgia, serif";
        ctx.font = `bold ${fontSize}px ${cssFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        const textX = centerX + (attrConfig.textOffsetX || 0) * scale * manaScale;
        const textY = centerY + (attrConfig.textOffsetY || 0) * scale * manaScale;

        // Alinhamento vertical fiel ao layout CSS (line-height: 1 centralizado verticalmente)
        const manaMetrics = ctx.measureText(numStr);
        const manaAscent = manaMetrics.fontBoundingBoxAscent ?? manaMetrics.actualBoundingBoxAscent;
        const manaDescent = manaMetrics.fontBoundingBoxDescent ?? manaMetrics.actualBoundingBoxDescent;
        const manaBaselineY = textY + (manaAscent - manaDescent) / 2;

        // Contorno opcional: SOMENTE se explicitamente ativado com espessura > 0
        if (attrConfig.strokeWidthPx && attrConfig.strokeWidthPx > 0) {
          ctx.strokeStyle = attrConfig.strokeColor || '#000000';
          ctx.lineWidth = attrConfig.strokeWidthPx * scale * manaScale;
          ctx.lineJoin = 'round';
          ctx.strokeText(numStr, textX, manaBaselineY);
        }

        // Preenchimento com a cor selecionada (sem contorno preto forçado)
        ctx.fillStyle = attrConfig.fontColor || '#ffffff';
        ctx.fillText(numStr, textX, manaBaselineY);
        ctx.restore();
      } catch (e) {
        console.warn('Erro ao desenhar mana/vida no canvas de exportação:', e);
      }
    }
  }

  // 4B. Renderizar Thresholds (Afinidades Elementais ao lado da Mana - se ativado e compatível com o atributo)
  const effectiveAttribute =
    selectedAttribute ||
    (frameConfig?.imageUrl ? findAttributeByFrameUrl(frameConfig.imageUrl, cardType)?.id : undefined);
  const allowedThresholdElements = getAllowedThresholdElements(effectiveAttribute, cardType);

  if (
    cardType !== 'avatar' &&
    allowedThresholdElements.length > 0 &&
    sorceryConfig?.threshold &&
    sorceryConfig.threshold.isVisible
  ) {
    const dist = computeThresholdDistribution(
      sorceryConfig.threshold,
      sorceryConfig.mana,
      allowedThresholdElements,
      cardType
    );

    if (cardType === 'site') {
      const symScale = sorceryConfig.threshold.scale || 1.0;
      const symWidthPercent = sorceryConfig.threshold.symbolWidthPercent * symScale;
      const symHeightPercent = sorceryConfig.threshold.symbolHeightPercent * symScale;
      const gapXPercent = (sorceryConfig.threshold.gapXPercent / 100) * symWidthPercent;
      const iw = (symWidthPercent / 100) * targetWidth;
      const ih = (symHeightPercent / 100) * targetHeight;
      const iy = (sorceryConfig.threshold.yPercent / 100) * targetHeight;

      for (let idx = 0; idx < dist.items.length; idx++) {
        const item = dist.items[idx];
        try {
          const itemImgSrc = getThresholdElementImagePath(
            item.element,
            sorceryConfig.threshold.elementImages
          );
          const itemImg = await loadImage(itemImgSrc);
          // O primeiro símbolo (idx=0) fica na âncora à direita, e os adicionais à esquerda
          const ix = (item.xPercent / 100) * targetWidth;

          ctx.save();
          ctx.globalAlpha = sorceryConfig.threshold.opacity ?? 1.0;
          drawCoverImage(ctx, itemImg, ix, iy, iw, ih, 'contain');
          ctx.restore();
        } catch {
          // Ignora falha de símbolo elemental isolado
        }
      }
    } else {
      // Demais tipos (Minion, etc.): comportamento original mantido 100% intacto
      for (const item of dist.items) {
        try {
          const itemImgSrc = getThresholdElementImagePath(
            item.element,
            sorceryConfig.threshold.elementImages
          );
          const itemImg = await loadImage(itemImgSrc);
          const ix = (item.xPercent / 100) * targetWidth;
          const iy = (item.yPercent / 100) * targetHeight;
          const symScale = sorceryConfig.threshold.scale || 1.0;
          const iw =
            ((sorceryConfig.threshold.symbolWidthPercent * symScale) / 100) *
            targetWidth;
          const ih =
            ((sorceryConfig.threshold.symbolHeightPercent * symScale) / 100) *
            targetHeight;

          ctx.save();
          ctx.globalAlpha = sorceryConfig.threshold.opacity;
          drawCoverImage(ctx, itemImg, ix, iy, iw, ih, 'contain');
          ctx.restore();
        } catch {
          // Ignora falha de símbolo elemental isolado
        }
      }
    }
  }

  // 4C. Renderizar Indicador de Combate Sorcery (Bloco A e Bloco B mutuamente exclusivos)
  if (
    hasCombatAttributes(cardType) &&
    sorceryConfig?.combat &&
    sorceryConfig.combat.isVisible &&
    (cardType !== 'site' || sorceryConfig.combat.siteCombatOption !== 'none')
  ) {
    const combat = sorceryConfig.combat;
    const isSingle =
      cardType === 'site'
        ? combat.siteCombatOption === 'attack-only'
        : combat.selectedType === 'attack-only';

    if (isSingle) {
      const single = combat.single;
      if (single && single.value !== undefined && single.value !== null && String(single.value).trim() !== '') {
        try {
          const singleScale = single.scale || 1.0;
          const baseCx = (single.xPercent / 100) * targetWidth;
          const baseCy = (single.yPercent / 100) * targetHeight;
          const baseCw = (single.widthPercent / 100) * targetWidth;
          const baseCh = (single.heightPercent / 100) * targetHeight;

          // Centralização com transformOrigin: center center
          const centerX = baseCx + baseCw / 2;
          const centerY = baseCy + baseCh / 2;
          const cw = baseCw * singleScale;
          const ch = baseCh * singleScale;
          const cx = centerX - cw / 2;
          const cy = centerY - ch / 2;

          ctx.save();
          ctx.globalAlpha = single.opacity !== undefined ? single.opacity : 1.0;

          // Imagem de fundo específica do Bloco A
          if (single.imageUrl) {
            const singleImg = await loadImage(single.imageUrl);
            if (single.keepAspectRatio) {
              drawCoverImage(ctx, singleImg, cx, cy, cw, ch, 'contain');
            } else {
              ctx.drawImage(singleImg, cx, cy, cw, ch);
            }
          }

          const atkAnchorX = single.attackXPercent ?? (single.numberAnchor?.xPercent ?? 50.0);
          const atkAnchorY = single.attackYPercent ?? (single.numberAnchor?.yPercent ?? 50.0);
          const atkStyle = single.style || DEFAULT_ATTACK_STYLE;

          // Imagem/ícone opcional de ataque
          if (single.attackImageUrl) {
            const iconImg = await loadImage(single.attackImageUrl);
            const iconX = cx + cw * (atkAnchorX / 100) + (atkStyle.offsetX || 0) * scale * singleScale;
            const iconY = cy + ch * (atkAnchorY / 100) + (atkStyle.offsetY || 0) * scale * singleScale;
            drawCoverImage(ctx, iconImg, iconX - cw * 0.25, iconY - ch * 0.25, cw * 0.5, ch * 0.5, 'contain');
          }

          // Número de Ataque
          const textX = cx + cw * (atkAnchorX / 100) + (atkStyle.offsetX || 0) * scale * singleScale;
          const textY = cy + ch * (atkAnchorY / 100) + (atkStyle.offsetY || 0) * scale * singleScale;

          const fontDef = AVAILABLE_FONTS.find((f) => f.id === atkStyle.fontFamily);
          const cssFontFamily = fontDef ? fontDef.cssFamily : "'Morpheus', Georgia, serif";
          const fontSize = Math.max(10, Math.round((atkStyle.fontSizePx || 22) * scale * singleScale));

          ctx.font = `${atkStyle.fontStyle || 'normal'} ${atkStyle.fontWeight || 'bold'} ${fontSize}px ${cssFontFamily}`;
          ctx.textAlign = (atkStyle.textAlign as CanvasTextAlign) || 'center';
          ctx.textBaseline = 'alphabetic';

          // Alinhamento vertical fiel ao layout CSS (translate(-50%, -50%) com line-height: 1)
          const singleMetrics = ctx.measureText(String(single.value));
          const singleAscent = singleMetrics.fontBoundingBoxAscent ?? singleMetrics.actualBoundingBoxAscent;
          const singleDescent = singleMetrics.fontBoundingBoxDescent ?? singleMetrics.actualBoundingBoxDescent;
          const singleBaselineY = textY + (singleAscent - singleDescent) / 2;

          if (atkStyle.strokeWidthPx && atkStyle.strokeWidthPx > 0) {
            ctx.strokeStyle = atkStyle.strokeColor || '#000000';
            ctx.lineWidth = atkStyle.strokeWidthPx * scale * singleScale;
            ctx.strokeText(String(single.value), textX, singleBaselineY);
          }
          ctx.fillStyle = atkStyle.fontColor || '#ffffff';
          ctx.fillText(String(single.value), textX, singleBaselineY);

          ctx.restore();
        } catch (e) {
          console.warn('Erro ao desenhar criatura com ataque no export:', e);
        }
      }
    } else {
      // Bloco B: Criatura com Ataque e Defesa
      const dual = combat.dual;
      const hasAtk = dual?.attackValue !== undefined && dual?.attackValue !== null && String(dual.attackValue).trim() !== '';
      const hasDef = dual?.defenseValue !== undefined && dual?.defenseValue !== null && String(dual.defenseValue).trim() !== '';

      if (dual && (hasAtk || hasDef)) {
        try {
          const dualScale = dual.scale || 1.0;
          const baseCx = (dual.xPercent / 100) * targetWidth;
          const baseCy = (dual.yPercent / 100) * targetHeight;
          const baseCw = (dual.widthPercent / 100) * targetWidth;
          const baseCh = (dual.heightPercent / 100) * targetHeight;

          // Centralização com transformOrigin: center center
          const centerX = baseCx + baseCw / 2;
          const centerY = baseCy + baseCh / 2;
          const cw = baseCw * dualScale;
          const ch = baseCh * dualScale;
          const cx = centerX - cw / 2;
          const cy = centerY - ch / 2;

          ctx.save();
          ctx.globalAlpha = dual.opacity !== undefined ? dual.opacity : 1.0;

          // Imagem de fundo específica do Bloco B
          if (dual.backgroundImageUrl) {
            const dualImg = await loadImage(dual.backgroundImageUrl);
            if (dual.keepAspectRatio) {
              drawCoverImage(ctx, dualImg, cx, cy, cw, ch, 'contain');
            } else {
              ctx.drawImage(dualImg, cx, cy, cw, ch);
            }
          }

          // Elemento 1: Ataque (Posicionamento independente)
          if (hasAtk) {
            const atkAnchorX = dual.attackXPercent ?? (dual.attackNumberAnchor?.xPercent ?? 35.5);
            const atkAnchorY = dual.attackYPercent ?? (dual.attackNumberAnchor?.yPercent ?? 46.5);
            const atkStyle = dual.attackStyle || DEFAULT_ATTACK_STYLE;

            if (dual.attackImageUrl) {
              const atkIcon = await loadImage(dual.attackImageUrl);
              const iconX = cx + cw * (atkAnchorX / 100) + (atkStyle.offsetX || 0) * scale * dualScale;
              const iconY = cy + ch * (atkAnchorY / 100) + (atkStyle.offsetY || 0) * scale * dualScale;
              drawCoverImage(ctx, atkIcon, iconX - cw * 0.2, iconY - ch * 0.2, cw * 0.4, ch * 0.4, 'contain');
            }

            const atkX = cx + cw * (atkAnchorX / 100) + (atkStyle.offsetX || 0) * scale * dualScale;
            const atkY = cy + ch * (atkAnchorY / 100) + (atkStyle.offsetY || 0) * scale * dualScale;

            const atkFontDef = AVAILABLE_FONTS.find((f) => f.id === atkStyle.fontFamily);
            const atkCssFont = atkFontDef ? atkFontDef.cssFamily : "'Morpheus', Georgia, serif";
            const atkFontSize = Math.max(10, Math.round((atkStyle.fontSizePx || 22) * scale * dualScale));

            ctx.font = `${atkStyle.fontStyle || 'normal'} ${atkStyle.fontWeight || 'bold'} ${atkFontSize}px ${atkCssFont}`;
            ctx.textAlign = (atkStyle.textAlign as CanvasTextAlign) || 'center';
            ctx.textBaseline = 'alphabetic';

            // Alinhamento vertical fiel ao layout CSS (translate(-50%, -50%) com line-height: 1)
            const atkMetrics = ctx.measureText(String(dual.attackValue));
            const atkAscent = atkMetrics.fontBoundingBoxAscent ?? atkMetrics.actualBoundingBoxAscent;
            const atkDescent = atkMetrics.fontBoundingBoxDescent ?? atkMetrics.actualBoundingBoxDescent;
            const atkBaselineY = atkY + (atkAscent - atkDescent) / 2;

            if (atkStyle.strokeWidthPx && atkStyle.strokeWidthPx > 0) {
              ctx.strokeStyle = atkStyle.strokeColor || '#000000';
              ctx.lineWidth = atkStyle.strokeWidthPx * scale * dualScale;
              ctx.strokeText(String(dual.attackValue), atkX, atkBaselineY);
            }
            ctx.fillStyle = atkStyle.fontColor || '#ffffff';
            ctx.fillText(String(dual.attackValue), atkX, atkBaselineY);
          }

          // Elemento 2: Defesa (Posicionamento totalmente independente)
          if (hasDef) {
            const defAnchorX = dual.defenseXPercent ?? (dual.defenseNumberAnchor?.xPercent ?? 65.0);
            const defAnchorY = dual.defenseYPercent ?? (dual.defenseNumberAnchor?.yPercent ?? 48.0);
            const defStyle = dual.defenseStyle || DEFAULT_DEFENSE_STYLE;

            if (dual.defenseImageUrl) {
              const defIcon = await loadImage(dual.defenseImageUrl);
              const iconX = cx + cw * (defAnchorX / 100) + (defStyle.offsetX || 0) * scale * dualScale;
              const iconY = cy + ch * (defAnchorY / 100) + (defStyle.offsetY || 0) * scale * dualScale;
              drawCoverImage(ctx, defIcon, iconX - cw * 0.2, iconY - ch * 0.2, cw * 0.4, ch * 0.4, 'contain');
            }

            const defX = cx + cw * (defAnchorX / 100) + (defStyle.offsetX || 0) * scale * dualScale;
            const defY = cy + ch * (defAnchorY / 100) + (defStyle.offsetY || 0) * scale * dualScale;

            const defFontDef = AVAILABLE_FONTS.find((f) => f.id === defStyle.fontFamily);
            const defCssFont = defFontDef ? defFontDef.cssFamily : "'Morpheus', Georgia, serif";
            const defFontSize = Math.max(10, Math.round((defStyle.fontSizePx || 22) * scale * dualScale));

            ctx.font = `${defStyle.fontStyle || 'normal'} ${defStyle.fontWeight || 'bold'} ${defFontSize}px ${defCssFont}`;
            ctx.textAlign = (defStyle.textAlign as CanvasTextAlign) || 'center';
            ctx.textBaseline = 'alphabetic';

            // Alinhamento vertical fiel ao layout CSS (translate(-50%, -50%) com line-height: 1)
            const defMetrics = ctx.measureText(String(dual.defenseValue));
            const defAscent = defMetrics.fontBoundingBoxAscent ?? defMetrics.actualBoundingBoxAscent;
            const defDescent = defMetrics.fontBoundingBoxDescent ?? defMetrics.actualBoundingBoxDescent;
            const defBaselineY = defY + (defAscent - defDescent) / 2;

            if (defStyle.strokeWidthPx && defStyle.strokeWidthPx > 0) {
              ctx.strokeStyle = defStyle.strokeColor || '#000000';
              ctx.lineWidth = defStyle.strokeWidthPx * scale * dualScale;
              ctx.strokeText(String(dual.defenseValue), defX, defBaselineY);
            }
            ctx.fillStyle = defStyle.fontColor || '#ffffff';
            ctx.fillText(String(dual.defenseValue), defX, defBaselineY);
          }

          ctx.restore();
        } catch (e) {
          console.warn('Erro ao desenhar criatura com ataque e defesa no export:', e);
        }
      }
    }
  }

  // 5A. Renderizar Título Composto Exclusivo para o Tipo Site (Nome + ' - ' + Tipo/Subtipo)
  if (cardType === 'site') {
    const titleBox = textBoxes.find((b) => b.role === 'title') || textBoxes.find((b) => b.id === 'box-title');
    const typeBox = textBoxes.find((b) => b.role === 'type') || textBoxes.find((b) => b.id === 'box-type');

    if (titleBox && titleBox.isVisible) {
      const x = (titleBox.xPercent / 100) * targetWidth;
      const y = (titleBox.yPercent / 100) * targetHeight;
      const w = (titleBox.widthPercent / 100) * targetWidth;
      const h = titleBox.heightPercent ? (titleBox.heightPercent / 100) * targetHeight : 40 * scale;

      // Fundo da caixa
      if (titleBox.bgColor && titleBox.bgColor !== 'transparent') {
        ctx.fillStyle = titleBox.bgColor;
        roundRect(ctx, x, y, w, h, (titleBox.borderRadiusPx || 0) * scale);
        ctx.fill();
      }

      // Borda da caixa
      if (titleBox.borderWidthPx > 0 && titleBox.borderColor && titleBox.borderColor !== 'transparent') {
        ctx.strokeStyle = titleBox.borderColor;
        ctx.lineWidth = titleBox.borderWidthPx * scale;
        roundRect(ctx, x, y, w, h, (titleBox.borderRadiusPx || 0) * scale);
        ctx.stroke();
      }

      const rawTitle = titleBox.content || '';
      const rawType = typeBox?.content || '';
      const hasTitle = rawTitle.trim().length > 0;
      const hasType = rawType.trim().length > 0;
      const hasSeparator = hasTitle && hasType;
      const sepStr = ' - ';

      if (hasTitle || hasType) {
        // Tipografia do Nome (Segmento 1)
        const titleFit = calculateAutoFitFontSize(titleBox, previewWidth, previewHeight);
        const titleFontSize = titleFit.effectiveFontSizePx;
        const computedTitleFontSize = Math.max(4, Math.round(titleFontSize * scale));
        const titleFontSpec = getCanvasFontSpec(titleBox, computedTitleFontSize);
        const titleColor = titleBox.textColor || '#ffffff';
        const hasTitleStroke = Boolean(titleBox.textStrokeEnabled && (titleBox.textStrokeWidthPx ?? 0) > 0);
        const titleStrokeWidth = (titleBox.textStrokeWidthPx || 0) * scale;
        const titleStrokeColor = titleBox.textStrokeColor || '#000000';

        // Tipografia do Tipo / Subtipo (Segmento 2 e Separador)
        const typeBaseFontSize = typeBox?.fontSizePx || Math.max(8, Math.round(titleFontSize * 0.75));
        const computedTypeFontSize = Math.max(4, Math.round(typeBaseFontSize * scale));
        const typeFontSpec = typeBox ? getCanvasFontSpec(typeBox, computedTypeFontSize) : titleFontSpec;
        const typeColor = typeBox?.textColor || titleColor;
        const hasTypeStroke = Boolean(typeBox?.textStrokeEnabled && (typeBox.textStrokeWidthPx ?? 0) > 0);
        const typeStrokeWidth = (typeBox?.textStrokeWidthPx || 0) * scale;
        const typeStrokeColor = typeBox?.textStrokeColor || '#000000';

        const padX = (titleBox.paddingXPx !== undefined ? titleBox.paddingXPx : (titleBox.paddingPx ?? 0)) * scale;
        const padY = (titleBox.paddingYPx !== undefined ? titleBox.paddingYPx : (titleBox.paddingPx ?? 0)) * scale;
        const availableWidth = Math.max(1, w - padX * 2);

        ctx.save();

        // Medição dos segmentos com precisão (considerando símbolos inline)
        ctx.font = titleFontSpec;
        if ('letterSpacing' in ctx) {
          const ls = (titleBox.letterSpacingPx || 0) * scale;
          (ctx as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
        }
        const titleChunks = parseTextWithSymbols(rawTitle);
        let measuredTitleWidth = 0;
        if (hasTitle) {
          for (const c of titleChunks) {
            measuredTitleWidth += measureChunkWidth(ctx, c, computedTitleFontSize);
          }
        }

        ctx.font = typeFontSpec;
        if ('letterSpacing' in ctx) {
          (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
        }
        const sepWidth = hasSeparator ? ctx.measureText(sepStr).width : 0;

        if ('letterSpacing' in ctx) {
          const ls = (typeBox?.letterSpacingPx || 0) * scale;
          (ctx as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
        }
        const typeChunks = parseTextWithSymbols(rawType);
        let measuredTypeWidth = 0;
        if (hasType) {
          for (const c of typeChunks) {
            measuredTypeWidth += measureChunkWidth(ctx, c, computedTypeFontSize);
          }
        }

        const totalWidth = measuredTitleWidth + sepWidth + measuredTypeWidth;

        // Alinhamento horizontal da linha única composta
        const alignment = titleBox.textAlign || 'center';
        let lineX = x + padX;
        if (alignment === 'center') {
          lineX = x + padX + Math.max(0, (availableWidth - totalWidth) / 2);
        } else if (alignment === 'right') {
          lineX = x + w - padX - totalWidth;
        }

        // Alinhamento vertical e cálculo da linha de base tipográfica contínua fiel ao CSS inline
        const effectiveLineHeight = titleBox.lineHeight !== undefined ? titleBox.lineHeight : 1.25;
        const halfLeading = ((effectiveLineHeight - 1) * computedTitleFontSize) / 2;
        const topY = y + padY + halfLeading;

        ctx.font = titleFontSpec;
        const titleMetrics = ctx.measureText(rawTitle || 'M');
        const titleAscent =
          titleMetrics.fontBoundingBoxAscent ??
          titleMetrics.actualBoundingBoxAscent ??
          computedTitleFontSize * 0.8;
        const baselineY = topY + titleAscent;

        ctx.textBaseline = 'alphabetic';
        ctx.textAlign = 'left';

        let curX = lineX;

        // 1. Renderiza o Nome da Carta (ancorado rigorosamente na baseline)
        if (hasTitle) {
          ctx.font = titleFontSpec;
          if ('letterSpacing' in ctx) {
            const ls = (titleBox.letterSpacingPx || 0) * scale;
            (ctx as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
          }
          drawLineWithSymbols(
            ctx,
            titleChunks,
            curX,
            baselineY,
            computedTitleFontSize,
            computedTitleFontSize,
            {
              enabled: hasTitleStroke,
              color: titleStrokeColor,
              width: titleStrokeWidth,
            },
            symbolImages
          );
          curX += measuredTitleWidth;
        }

        // 2. Renderiza o Separador Automático " - " (mesma baseline comum do CSS)
        if (hasSeparator) {
          ctx.font = typeFontSpec;
          if ('letterSpacing' in ctx) {
            (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
          }
          if (hasTypeStroke && typeStrokeWidth > 0) {
            ctx.save();
            ctx.strokeStyle = typeStrokeColor;
            ctx.lineWidth = typeStrokeWidth * 2;
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            ctx.strokeText(sepStr, curX, baselineY);
            ctx.restore();
          }
          ctx.fillStyle = typeColor;
          ctx.fillText(sepStr, curX, baselineY);
          curX += sepWidth;
        }

        // 3. Renderiza o Tipo e Subtipo (mesma baseline comum do CSS)
        if (hasType) {
          ctx.font = typeFontSpec;
          if ('letterSpacing' in ctx) {
            const ls = (typeBox?.letterSpacingPx || 0) * scale;
            (ctx as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
          }
          drawLineWithSymbols(
            ctx,
            typeChunks,
            curX,
            baselineY,
            computedTypeFontSize,
            computedTypeFontSize,
            {
              enabled: hasTypeStroke,
              color: typeStrokeColor,
              width: typeStrokeWidth,
            },
            symbolImages
          );
        }

        // Reset de espaçamento
        if ('letterSpacing' in ctx) {
          (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
        }

        ctx.restore();
      }
    }
  }

  // 6. Renderizar Caixas de Texto com Espaçamentos Avançados
  for (const box of textBoxes) {
    if (!box.isVisible) continue;
    // No tipo Site, o título e tipo/subtipo são gerenciados exclusivamente pelo SiteCompositeTitle
    if (
      cardType === 'site' &&
      (box.role === 'title' || box.role === 'type' || box.id === 'box-title' || box.id === 'box-type')
    ) {
      continue;
    }

    const x = (box.xPercent / 100) * targetWidth;
    const y = (box.yPercent / 100) * targetHeight;
    const w = (box.widthPercent / 100) * targetWidth;
    const h = box.heightPercent ? (box.heightPercent / 100) * targetHeight : 40 * scale;

    // Fundo da caixa
    if (box.bgColor && box.bgColor !== 'transparent') {
      ctx.fillStyle = box.bgColor;
      roundRect(ctx, x, y, w, h, box.borderRadiusPx * scale);
      ctx.fill();
    }

    // Borda da caixa
    if (box.borderWidthPx > 0 && box.borderColor && box.borderColor !== 'transparent') {
      ctx.strokeStyle = box.borderColor;
      ctx.lineWidth = box.borderWidthPx * scale;
      roundRect(ctx, x, y, w, h, box.borderRadiusPx * scale);
      ctx.stroke();
    }

    // Configuração Tipográfica com Auto Fit
    ctx.fillStyle = box.textColor || '#000000';
    const fitResult = calculateAutoFitFontSize(box, previewWidth, previewHeight);
    const effectiveBaseFontSize = fitResult.effectiveFontSizePx;
    const computedFontSize = Math.max(4, Math.round(effectiveBaseFontSize * scale));
    ctx.font = getCanvasFontSpec(box, computedFontSize);
    ctx.textBaseline = 'top';

    // Aplicação de Espaçamento entre Letras (Letter Spacing) no Canvas
    if ('letterSpacing' in ctx) {
      const letterSpace = (box.letterSpacingPx || 0) * scale;
      (ctx as unknown as { letterSpacing: string }).letterSpacing = `${letterSpace}px`;
    }

    // Aplicação de Espaçamento entre Palavras (Word Spacing) no Canvas
    if ('wordSpacing' in ctx) {
      const wordSpace = (box.wordSpacingPx || 0) * scale;
      (ctx as unknown as { wordSpacing: string }).wordSpacing = `${wordSpace}px`;
    }

    const padX = (box.paddingXPx !== undefined ? box.paddingXPx : (box.paddingPx ?? 0)) * scale;
    const padY = (box.paddingYPx !== undefined ? box.paddingYPx : (box.paddingPx ?? 0)) * scale;
    const innerH = Math.max(1, h - padY * 2);

    // Cálculo da entrelinha proporcional (line-height)
    const effectiveLineHeight = box.lineHeight !== undefined ? box.lineHeight : 1.25;
    const lineHeightPx = computedFontSize * effectiveLineHeight;
    const paragraphSpacingPx = (box.paragraphSpacingPx !== undefined ? box.paragraphSpacingPx : 4) * scale;

    const hasStroke = Boolean(box.textStrokeEnabled && (box.textStrokeWidthPx ?? 0) > 0);
    const strokeWidth = (box.textStrokeWidthPx || 0) * scale;
    const strokeColor = box.textStrokeColor || '#000000';

    if (box.isMultiline) {
      wrapTextAdvanced(
        ctx,
        box.content,
        x,
        y,
        w,
        h,
        padX,
        padY,
        lineHeightPx,
        paragraphSpacingPx,
        box.textAlign,
        cardType === 'site' ? undefined : box.paragraphAlignments,
        {
          enabled: hasStroke,
          color: strokeColor,
          width: strokeWidth,
        },
        computedFontSize,
        symbolImages,
        cardType === 'site'
      );
    } else {
      const singleAlign =
        cardType === 'site'
          ? (box.textAlign || 'left')
          : ((box.paragraphAlignments && box.paragraphAlignments[0]) || box.textAlign || 'left');
      const chunks = parseTextWithSymbols(box.content);
      let totalW = 0;
      for (const c of chunks) {
        totalW += measureChunkWidth(ctx, c, computedFontSize);
      }

      let textX = x + padX;
      if (singleAlign === 'center') {
        textX = (x + w / 2) - totalW / 2;
      } else if (singleAlign === 'right') {
        textX = (x + w - padX) - totalW;
      } else {
        textX = x + padX;
      }

      // Alinhamento vertical fiel ao CSS do editor: top + padY + compensação de entrelinha proporcional
      const halfLeading = ((effectiveLineHeight - 1) * computedFontSize) / 2;
      const textY = y + padY + halfLeading;

      drawLineWithSymbols(
        ctx,
        chunks,
        textX,
        textY,
        computedFontSize,
        lineHeightPx,
        {
          enabled: hasStroke,
          color: strokeColor,
          width: strokeWidth,
        },
        symbolImages
      );
    }

    // Reset de espaçamentos para evitar vazamentos em outros elementos
    if ('letterSpacing' in ctx) {
      (ctx as unknown as { letterSpacing: string }).letterSpacing = '0px';
    }
    if ('wordSpacing' in ctx) {
      (ctx as unknown as { wordSpacing: string }).wordSpacing = '0px';
    }
  }

  // 7. Download automático do arquivo PNG com cantos transparentes e recorte fiel
  ctx.restore();
  const dataUrl = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.download = fileName;
  link.href = dataUrl;
  link.click();
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    const safeSrc =
      src.startsWith('data:') || src.startsWith('blob:')
        ? src
        : encodeURI(decodeURI(src));
    img.src = safeSrc;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  fit: 'cover' | 'contain' | 'fill',
  scale: number = 1.0,
  offsetXPercent: number = 0,
  offsetYPercent: number = 0
) {
  const safeScale = scale > 0 ? scale : 1.0;
  if (fit === 'fill') {
    const dw = w * safeScale;
    const dh = h * safeScale;
    const centerX = x + w / 2 + (offsetXPercent / 100) * w;
    const centerY = y + h / 2 + (offsetYPercent / 100) * h;
    const dx = centerX - dw / 2;
    const dy = centerY - dh / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
    return;
  }

  const imgRatio = img.width / img.height;
  const targetRatio = w / h;

  let baseDw = w;
  let baseDh = h;

  if (fit === 'cover') {
    if (imgRatio > targetRatio) {
      baseDw = h * imgRatio;
      baseDh = h;
    } else {
      baseDw = w;
      baseDh = w / imgRatio;
    }
  } else {
    // contain
    if (imgRatio > targetRatio) {
      baseDw = w;
      baseDh = w / imgRatio;
    } else {
      baseDw = h * imgRatio;
      baseDh = h;
    }
  }

  const dw = baseDw * safeScale;
  const dh = baseDh * safeScale;
  const centerX = x + w / 2 + (offsetXPercent / 100) * w;
  const centerY = y + h / 2 + (offsetYPercent / 100) * h;
  const dx = centerX - dw / 2;
  const dy = centerY - dh / 2;

  ctx.drawImage(img, dx, dy, dw, dh);
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * Renderizador avançado de texto com quebra por parágrafos manuais (\n),
 * entrelinha customizada (line-height), espaçamento entre parágrafos
 * e alinhamento individual por parágrafo / linha.
 */
/**
 * Mede a largura de um pedaço de texto ou símbolo para layout no canvas
 */
function measureChunkWidth(
  ctx: CanvasRenderingContext2D,
  chunk: ParsedTextChunk,
  fontSize: number
): number {
  if (chunk.type === 'symbol') {
    const iconSize = fontSize * 1.05;
    const margin = fontSize * 0.12;
    return iconSize + margin * 2;
  }
  return ctx.measureText(chunk.text).width;
}

/**
 * Desenha uma linha de texto com símbolos de Threshold inline e contorno opcional
 */
function drawLineWithSymbols(
  ctx: CanvasRenderingContext2D,
  chunks: ParsedTextChunk[],
  startX: number,
  y: number,
  fontSize: number,
  lineHeight: number,
  strokeOptions?: { enabled: boolean; color: string; width: number },
  symbolImages?: Record<string, HTMLImageElement>
) {
  let curX = startX;
  const iconSize = fontSize * 1.05;
  const marginX = fontSize * 0.12;
  const isAlphabetic = ctx.textBaseline === 'alphabetic';
  const iconY = isAlphabetic
    ? y - fontSize * 0.78 + (fontSize - iconSize) / 2
    : y + (fontSize - iconSize) / 2 + fontSize * 0.05;

  for (const chunk of chunks) {
    if (chunk.type === 'symbol') {
      const img = symbolImages?.[chunk.element];
      if (img) {
        ctx.drawImage(img, curX + marginX, iconY, iconSize, iconSize);
      }
      curX += iconSize + marginX * 2;
    } else {
      if (strokeOptions?.enabled && strokeOptions.width > 0) {
        ctx.save();
        ctx.strokeStyle = strokeOptions.color;
        ctx.lineWidth = strokeOptions.width * 2;
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(chunk.text, curX, y);
        ctx.restore();
      }
      ctx.fillText(chunk.text, curX, y);
      curX += ctx.measureText(chunk.text).width;
    }
  }
}

/**
 * Renderizador avançado de texto com quebra por parágrafos manuais (\n),
 * entrelinha customizada (line-height), espaçamento entre parágrafos,
 * alinhamento individual por parágrafo / linha e suporte a símbolos de Threshold.
 */
function wrapTextAdvanced(
  ctx: CanvasRenderingContext2D,
  text: string,
  boxX: number,
  boxY: number,
  boxW: number,
  boxH: number,
  padX: number,
  padY: number,
  lineHeight: number,
  paragraphSpacing: number,
  defaultAlign: 'left' | 'center' | 'right' | 'justify',
  paragraphAlignments?: ('left' | 'center' | 'right' | 'justify')[],
  strokeOptions?: {
    enabled: boolean;
    color: string;
    width: number;
  },
  fontSize: number = 14,
  symbolImages?: Record<string, HTMLImageElement>,
  isSite: boolean = false
) {
  const paragraphs = text.split(/\r?\n/);
  const halfLeading = isSite ? Math.max(0, (lineHeight - fontSize) / 2) : 0;
  let currentY = boxY + padY + halfLeading;
  const maxWidth = Math.max(10, boxW - padX * 2);
  const maxHeight = Math.max(10, boxH - padY * 2);

  for (let p = 0; p < paragraphs.length; p++) {
    const paragraph = paragraphs[p];
    const pAlign = (paragraphAlignments && paragraphAlignments[p]) || defaultAlign || 'left';

    // Parágrafo vazio (linha em branco intencional)
    if (!paragraph.trim()) {
      currentY += lineHeight + paragraphSpacing;
      if (currentY > boxY + padY + maxHeight) return;
      continue;
    }

    const rawWords = paragraph.split(' ');
    let currentLineChunks: ParsedTextChunk[] = [];
    let currentLineWidth = 0;
    const spaceWidth = ctx.measureText(' ').width;

    const flushLine = () => {
      if (currentLineChunks.length === 0) return;
      let startX = boxX + padX;
      if (pAlign === 'center') {
        startX = boxX + padX + (maxWidth - currentLineWidth) / 2;
      } else if (pAlign === 'right') {
        startX = boxX + padX + (maxWidth - currentLineWidth);
      }
      drawLineWithSymbols(
        ctx,
        currentLineChunks,
        startX,
        currentY,
        fontSize,
        lineHeight,
        strokeOptions,
        symbolImages
      );
      currentY += lineHeight;
      currentLineChunks = [];
      currentLineWidth = 0;
    };

    for (let n = 0; n < rawWords.length; n++) {
      const rawWord = rawWords[n];
      const wordChunks = parseTextWithSymbols(rawWord);
      let wordWidth = 0;
      for (const c of wordChunks) {
        wordWidth += measureChunkWidth(ctx, c, fontSize);
      }

      const neededWidth = currentLineChunks.length > 0 ? spaceWidth + wordWidth : wordWidth;

      if (currentLineWidth + neededWidth > maxWidth && currentLineChunks.length > 0) {
        if (currentY + lineHeight > boxY + padY + maxHeight) {
          flushLine();
          return;
        }
        flushLine();
        currentLineChunks = [...wordChunks];
        currentLineWidth = wordWidth;
      } else {
        if (currentLineChunks.length > 0) {
          currentLineChunks.push({ type: 'text', text: ' ' });
          currentLineWidth += spaceWidth;
        }
        currentLineChunks.push(...wordChunks);
        currentLineWidth += wordWidth;
      }
    }

    if (currentLineChunks.length > 0) {
      if (currentY + lineHeight > boxY + padY + maxHeight) {
        flushLine();
        return;
      }
      flushLine();
    }

    // Adiciona espaçamento entre parágrafos (apenas se não for o último parágrafo)
    if (p < paragraphs.length - 1) {
      currentY += paragraphSpacing;
    }
  }
}
