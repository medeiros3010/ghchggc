import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  CardArtConfig,
  CardDimensionsConfig,
  CardFrameConfig,
  CardSymbolsConfig,
  CustomSymbolConfig,
  TextBoxConfig,
} from '../types/card';
import {
  SorceryIndicatorsConfig,
  computeThresholdDistribution,
  getCombatMode,
  SorceryCombatConfig,
  SorceryThresholdConfig,
  DEFAULT_ATTACK_STYLE,
  DEFAULT_DEFENSE_STYLE,
  SORCERY_ELEMENTS,
  getThresholdElementImagePath,
} from '../types/sorcery';
import { Upload, Move, Lock, Unlock, RotateCw, AlertTriangle } from 'lucide-react';
import { getFontCssProperties } from '../utils/fontHelper';
import { calculateAutoFitFontSize } from '../utils/textFit';
import { hasCombatAttributes, CardTypeId } from '../types/cardType';
import { CardAttributeId, getAllowedThresholdElements, findAttributeByFrameUrl } from '../types/cardAttribute';
import { SiteCompositeTitle } from './site/SiteCompositeTitle';
import { renderFormattedTextWithSymbols } from '../utils/textSymbols';

interface CardCanvasProps {
  cardType?: import('../types/cardType').CardTypeId | null;
  selectedAttribute?: CardAttributeId;
  dimensions: CardDimensionsConfig;
  artConfig: CardArtConfig;
  frameConfig: CardFrameConfig;
  symbolsConfig?: CardSymbolsConfig;
  sorceryConfig?: SorceryIndicatorsConfig;
  onUpdateSorceryCombat?: (updates: Partial<SorceryCombatConfig>) => void;
  onUpdateSorceryThreshold?: (updates: Partial<SorceryThresholdConfig>) => void;
  isCombatSelected?: boolean;
  onSelectCombat?: () => void;
  textBoxes: TextBoxConfig[];
  selectedBoxId: string | null;
  selectedSymbolId?: 'manaSymbol' | 'attackSymbol' | null;
  isCombatLocked?: boolean;
  onSelectBox: (id: string | null) => void;
  onSelectSymbol?: (id: 'manaSymbol' | 'attackSymbol' | null) => void;
  onUpdateTextBox: (id: string, updates: Partial<TextBoxConfig>) => void;
  onUpdateSymbol?: (id: 'manaSymbol' | 'attackSymbol', updates: Partial<CustomSymbolConfig>) => void;
  onUploadImage: (file: File) => void;
  onUploadCardFrame?: (file: File) => void;
  showGuides: boolean;
  isEditMode: boolean; // true = modo edição com caixas demarcadas e handles, false = preview limpo
  zoom: number; // 0.8 a 1.5
}

/**
 * COMPONENTE VISUAL DA CARTA (CardCanvas)
 * 
 * Gerencia proporção física (63mm x 88mm), camada de arte frontal,
 * cardframe PNG transparente, símbolos superiores (Mana e Ataque)
 * e caixas de texto com controles tipográficos avançados.
 */
export const CardCanvas: React.FC<CardCanvasProps> = ({
  cardType,
  selectedAttribute,
  dimensions,
  artConfig,
  frameConfig,
  symbolsConfig,
  sorceryConfig,
  onUpdateSorceryCombat,
  onUpdateSorceryThreshold,
  isCombatSelected,
  onSelectCombat,
  isCombatLocked = false,
  textBoxes,
  selectedBoxId,
  selectedSymbolId,
  onSelectBox,
  onSelectSymbol,
  onUpdateTextBox,
  onUpdateSymbol,
  onUploadImage,
  showGuides,
  isEditMode,
  zoom,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingBoxId, setEditingBoxId] = useState<string | null>(null);

  // Estados para arrasto (drag & drop) e redimensionamento unificado
  const [dragState, setDragState] = useState<{
    targetKind: 'box' | 'symbol' | 'combat' | 'threshold';
    targetId: string;
    type: 'move' | 'resize';
    startX: number;
    startY: number;
    initialXPercent: number;
    initialYPercent: number;
    initialWidthPercent: number;
    initialHeightPercent: number;
    keepAspectRatio?: boolean;
  } | null>(null);

  // Iniciar arraste de posição dos thresholds do Site (100% livre)
  const handleStartMoveSiteThreshold = (
    e: React.PointerEvent,
    bounds: { startXPercent: number; startYPercent: number; widthPercent: number; heightPercent: number }
  ) => {
    if (!isEditMode || !sorceryConfig?.threshold) return;
    e.stopPropagation();
    onSelectSymbol?.(null);
    onSelectBox('site-threshold');

    setDragState({
      targetKind: 'threshold',
      targetId: 'siteThreshold',
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: sorceryConfig.threshold.xPercent,
      initialYPercent: sorceryConfig.threshold.yPercent,
      initialWidthPercent: Math.max(bounds.widthPercent, 4),
      initialHeightPercent: Math.max(bounds.heightPercent, 4),
    });
  };

  // Iniciar arraste de posição de caixa de texto
  const handleStartMoveBox = (e: React.PointerEvent, box: TextBoxConfig) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelectSymbol?.(null);
    onSelectBox(box.id);

    setDragState({
      targetKind: 'box',
      targetId: box.id,
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: box.xPercent,
      initialYPercent: box.yPercent,
      initialWidthPercent: box.widthPercent,
      initialHeightPercent: box.heightPercent || 5,
    });
  };

  // Iniciar redimensionamento de caixa de texto
  const handleStartResizeBox = (e: React.PointerEvent, box: TextBoxConfig) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelectSymbol?.(null);
    onSelectBox(box.id);

    setDragState({
      targetKind: 'box',
      targetId: box.id,
      type: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: box.xPercent,
      initialYPercent: box.yPercent,
      initialWidthPercent: box.widthPercent,
      initialHeightPercent: box.heightPercent || 5,
    });
  };

  // Iniciar arraste de posição de Símbolo Superior (Mana ou Ataque antigo)
  const handleStartMoveSymbol = (e: React.PointerEvent, sym: CustomSymbolConfig) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelectBox(null);
    onSelectSymbol?.(sym.id);

    setDragState({
      targetKind: 'symbol',
      targetId: sym.id,
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: sym.xPercent,
      initialYPercent: sym.yPercent,
      initialWidthPercent: sym.widthPercent,
      initialHeightPercent: sym.heightPercent,
    });
  };

  // Iniciar redimensionamento de Símbolo Superior
  const handleStartResizeSymbol = (e: React.PointerEvent, sym: CustomSymbolConfig) => {
    if (!isEditMode) return;
    e.stopPropagation();
    onSelectBox(null);
    onSelectSymbol?.(sym.id);

    setDragState({
      targetKind: 'symbol',
      targetId: sym.id,
      type: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: sym.xPercent,
      initialYPercent: sym.yPercent,
      initialWidthPercent: sym.widthPercent,
      initialHeightPercent: sym.heightPercent,
      keepAspectRatio: sym.keepAspectRatio,
    });
  };

  // Iniciar arraste de posição do Indicador de Combate Sorcery (Ataque ou Ataque + Defesa)
  const handleStartMoveCombat = (e: React.PointerEvent) => {
    if (!hasCombatAttributes(cardType) || !isEditMode || !sorceryConfig?.combat) return;
    e.stopPropagation();
    onSelectBox(null);
    onSelectCombat?.();

    const combat = sorceryConfig.combat;
    const isSingle = combat.selectedType === 'attack-only';
    const current = isSingle ? combat.single : combat.dual;

    setDragState({
      targetKind: 'combat',
      targetId: 'sorceryCombat',
      type: 'move',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: current.xPercent,
      initialYPercent: current.yPercent,
      initialWidthPercent: current.widthPercent,
      initialHeightPercent: current.heightPercent,
      keepAspectRatio: current.keepAspectRatio,
    });
  };

  // Iniciar redimensionamento do Indicador de Combate Sorcery
  const handleStartResizeCombat = (e: React.PointerEvent) => {
    if (!hasCombatAttributes(cardType) || !isEditMode || !sorceryConfig?.combat) return;
    e.stopPropagation();
    onSelectBox(null);
    onSelectCombat?.();

    const combat = sorceryConfig.combat;
    const isSingle = combat.selectedType === 'attack-only';
    const current = isSingle ? combat.single : combat.dual;

    setDragState({
      targetKind: 'combat',
      targetId: 'sorceryCombat',
      type: 'resize',
      startX: e.clientX,
      startY: e.clientY,
      initialXPercent: current.xPercent,
      initialYPercent: current.yPercent,
      initialWidthPercent: current.widthPercent,
      initialHeightPercent: current.heightPercent,
      keepAspectRatio: current.keepAspectRatio,
    });
  };

  // Processar movimento do ponteiro com coordenadas relativas percentuais
  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!dragState || !cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const deltaXPercent = ((e.clientX - dragState.startX) / rect.width) * 100;
      const deltaYPercent = ((e.clientY - dragState.startY) / rect.height) * 100;

      if (dragState.targetKind === 'box') {
        if (dragState.type === 'move') {
          const newX = Math.max(0, Math.min(100 - dragState.initialWidthPercent, dragState.initialXPercent + deltaXPercent));
          const newY = Math.max(0, Math.min(95, dragState.initialYPercent + deltaYPercent));

          onUpdateTextBox(dragState.targetId, {
            xPercent: Math.round(newX * 10) / 10,
            yPercent: Math.round(newY * 10) / 10,
          });
        } else if (dragState.type === 'resize') {
          const newW = Math.max(10, Math.min(100 - dragState.initialXPercent, dragState.initialWidthPercent + deltaXPercent));
          const newH = Math.max(3, Math.min(90 - dragState.initialYPercent, dragState.initialHeightPercent + deltaYPercent));

          onUpdateTextBox(dragState.targetId, {
            widthPercent: Math.round(newW * 10) / 10,
            heightPercent: Math.round(newH * 10) / 10,
          });
        }
      } else if (dragState.targetKind === 'combat' && onUpdateSorceryCombat && sorceryConfig?.combat) {
        const combat = sorceryConfig.combat;
        const isSingle = combat.selectedType === 'attack-only';

        if (dragState.type === 'move') {
          const newX = Math.max(0, Math.min(100 - dragState.initialWidthPercent, dragState.initialXPercent + deltaXPercent));
          const newY = Math.max(0, Math.min(100 - dragState.initialHeightPercent, dragState.initialYPercent + deltaYPercent));

          if (isSingle) {
            onUpdateSorceryCombat({
              single: {
                ...combat.single,
                xPercent: Math.round(newX * 10) / 10,
                yPercent: Math.round(newY * 10) / 10,
              },
            });
          } else {
            onUpdateSorceryCombat({
              dual: {
                ...combat.dual,
                xPercent: Math.round(newX * 10) / 10,
                yPercent: Math.round(newY * 10) / 10,
              },
            });
          }
        } else if (dragState.type === 'resize') {
          const newW = Math.max(4, Math.min(70, dragState.initialWidthPercent + deltaXPercent));
          let newH: number;
          if (dragState.keepAspectRatio) {
            newH = newW * (dragState.initialHeightPercent / dragState.initialWidthPercent);
          } else {
            newH = Math.max(3, Math.min(40, dragState.initialHeightPercent + deltaYPercent));
          }

          if (isSingle) {
            onUpdateSorceryCombat({
              single: {
                ...combat.single,
                widthPercent: Math.round(newW * 10) / 10,
                heightPercent: Math.round(newH * 10) / 10,
              },
            });
          } else {
            onUpdateSorceryCombat({
              dual: {
                ...combat.dual,
                widthPercent: Math.round(newW * 10) / 10,
                heightPercent: Math.round(newH * 10) / 10,
              },
            });
          }
        }
      } else if (dragState.targetKind === 'threshold' && onUpdateSorceryThreshold && sorceryConfig?.threshold) {
        if (dragState.type === 'move') {
          const newX = Math.max(0, Math.min(100 - dragState.initialWidthPercent, dragState.initialXPercent + deltaXPercent));
          const newY = Math.max(0, Math.min(95, dragState.initialYPercent + deltaYPercent));

          onUpdateSorceryThreshold({
            xPercent: Math.round(newX * 10) / 10,
            yPercent: Math.round(newY * 10) / 10,
          });
        }
      }
    },
    [dragState, onUpdateTextBox, onUpdateSorceryCombat, onUpdateSorceryThreshold, sorceryConfig]
  );

  const handlePointerUp = useCallback(() => {
    setDragState(null);
  }, []);

  useEffect(() => {
    if (dragState) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [dragState, handlePointerMove, handlePointerUp]);

  // Upload por arrastar e soltar (drag & drop direto na carta)
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onUploadImage(file);
      }
    }
  };

  // Base de largura da carta na tela (em pixels antes do zoom)
  // Padrão oficial Sorcery: 63mm × 88mm vertical (360 × 503 px); Site: 88mm × 63mm horizontal (503 × 360 px)
  const isLandscape = dimensions.widthMm > dimensions.heightMm;
  const baseWidth = isLandscape ? 503 : 360;
  const baseHeight = isLandscape ? 360 : Math.round(360 / dimensions.aspectRatio);


  return (
    <div className="flex flex-col items-center justify-start p-6 select-none min-w-full">
      {/* Container de Escala / Zoom com dimensionamento explícito para permitir rolagem e pan até 500% */}
      <div
        style={{
          width: `${baseWidth * zoom}px`,
          height: `${baseHeight * zoom}px`,
          position: 'relative',
          transition: 'width 0.12s ease-out, height 0.12s ease-out',
        }}
        className="flex items-start justify-center shrink-0"
      >
        <div
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            transform: `scale(${zoom})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          {/* CONTAINER PRINCIPAL DA CARTA (PROPORÇÃO FIXA 63mm x 88mm) */}
        <div
          ref={cardRef}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => {
            onSelectBox(null);
            onSelectSymbol?.(null);
          }}
          style={{
            width: `${baseWidth}px`,
            height: `${baseHeight}px`,
            borderRadius: `${dimensions.borderRadiusPx}px`,
            isolation: 'isolate',
            WebkitMaskImage: '-webkit-radial-gradient(white, black)',
          }}
          className="relative bg-[#1A1916] overflow-hidden shadow-[0_16px_50px_rgba(0,0,0,0.8)] ring-1 ring-[#65543C]/40"
        >
          {/* CAMADA 1: GUIA DE SANGRIA E MARGEM DE SEGURANÇA */}
          {showGuides && isEditMode && (
            <div
              className="absolute inset-[14px] border border-dashed border-[#C5A675] pointer-events-none z-40 opacity-70 rounded-sm"
              title="Margem Segura de Impressão (Safe Zone)"
            >
              <span className="absolute top-1 left-1 text-[9px] font-mono text-[#E8DECA] bg-[#302D27] border border-[#65543C] px-1 rounded">
                Safe Margin 3mm
              </span>
              <div className="absolute top-1/2 left-0 right-0 border-t border-dotted border-[#C5A675] opacity-30" />
              <div className="absolute top-0 bottom-0 left-1/2 border-l border-dotted border-[#C5A675] opacity-30" />
            </div>
          )}

          {/* CAMADA 2: ARTE FRONTAL (Upload de Imagem ou Wireframe) */}
          {artConfig.mode === 'full-bleed' ? (
            <div className="absolute inset-0 z-0 bg-[#24221E] flex items-center justify-center">
              {artConfig.imageUrl ? (
                <img
                  src={artConfig.imageUrl}
                  alt="Arte Frontal da Carta"
                  style={{
                    opacity: artConfig.opacity,
                    objectFit: artConfig.fit,
                  }}
                  className="w-full h-full pointer-events-none"
                />
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="w-full h-full flex flex-col items-center justify-center text-[#B5A995] hover:text-[#E8DECA] hover:bg-[#2B2822] cursor-pointer transition-colors p-6 text-center border-2 border-dashed border-[#65543C] hover:border-[#C5A675] m-2 rounded-lg"
                >
                  <Upload className="w-8 h-8 mb-2 opacity-60 text-[#C5A675]" />
                  <span className="text-xs font-semibold">Carregar Imagem Frontal</span>
                  <span className="text-[10px] text-[#8F8270] mt-1">
                    Arraste uma imagem ou clique para selecionar
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div
              style={{
                top: `${artConfig.frameTopPercent}%`,
                left: `${artConfig.frameMarginPercent}%`,
                right: `${artConfig.frameMarginPercent}%`,
                height: `${artConfig.frameHeightPercent}%`,
              }}
              className="absolute z-0 bg-[#24221E] border border-[#65543C] overflow-hidden rounded-md flex items-center justify-center shadow-inner"
            >
              {artConfig.imageUrl ? (
                <img
                  src={artConfig.imageUrl}
                  alt="Arte Frontal da Carta"
                  style={{
                    opacity: artConfig.opacity,
                    objectFit: artConfig.fit,
                  }}
                  className="w-full h-full pointer-events-none"
                />
              ) : (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    fileInputRef.current?.click();
                  }}
                  className="w-full h-full flex flex-col items-center justify-center text-[#B5A995] hover:text-[#E8DECA] hover:bg-[#2B2822] cursor-pointer transition-colors p-4 text-center border border-dashed border-[#65543C] hover:border-[#C5A675] m-1 rounded"
                >
                  <Upload className="w-6 h-6 mb-1 opacity-60 text-[#C5A675]" />
                  <span className="text-xs font-medium">Área Designada para Arte</span>
                  <span className="text-[10px] text-[#8F8270]">Clique para carregar imagem</span>
                </div>
              )}
            </div>
          )}

          {/* CAMADA 3: CARDFRAME (MOLDURA FRONTAL COM TRANSPARÊNCIA) */}
          {frameConfig?.imageUrl && frameConfig.isVisible && (
            <div className="absolute inset-0 z-10 pointer-events-none">
              <img
                src={frameConfig.imageUrl}
                alt="Cardframe / Moldura Frontal"
                style={{
                  opacity: frameConfig.opacity,
                  objectFit: frameConfig.fit,
                }}
                className="w-full h-full"
              />
            </div>
          )}

          {/* CAMADA 4A: INDICADOR FIXO DE MANA SORCERY / VIDA (AVATAR) (NÃO RENDERIZADO EM CARTAS SITE) */}
          {cardType !== 'site' && (() => {
            const isAvatar = cardType === 'avatar';
            const attrConfig = isAvatar ? (sorceryConfig?.vida || sorceryConfig?.mana) : sorceryConfig?.mana;
            if (!attrConfig || !attrConfig.isVisible) return null;

            const iconSrc = isAvatar
              ? (attrConfig.imageUrl || '/assets/sorcery/vida(1).png')
              : (attrConfig.imageUrl || '/assets/sorcery/mana.png?v=2');
            const displayValue = attrConfig.quantity ?? (isAvatar ? 20 : 0);

            return (
              <div
                style={{
                  left: `${attrConfig.xPercent}%`,
                  top: `${attrConfig.yPercent}%`,
                  width: `${attrConfig.widthPercent}%`,
                  height: `${attrConfig.heightPercent}%`,
                  opacity: attrConfig.opacity,
                  zIndex: attrConfig.zIndex || 50,
                  transform: `scale(${attrConfig.scale || 1})`,
                  transformOrigin: 'center center',
                }}
                className="absolute pointer-events-none select-none flex items-center justify-center"
                title={isAvatar ? `Vida: ${displayValue}` : `Mana: ${displayValue}`}
              >
                {/* Ícone de Vida (Gota de Sangue/Vida) ou Esfera de Mana */}
                <img
                  src={iconSrc}
                  alt={isAvatar ? "Símbolo de Vida" : "Símbolo de Mana"}
                  style={{
                    objectFit: attrConfig.keepAspectRatio ? 'contain' : 'fill',
                  }}
                  className="w-full h-full pointer-events-none select-none"
                />

                {/* Número de Vida / Mana centralizado sobre o ícone */}
                <div
                  style={{
                    fontFamily: getFontCssProperties(attrConfig.fontFamily).fontFamily,
                    fontSize: `${attrConfig.fontSizePx || 20}px`,
                    color: attrConfig.fontColor || '#ffffff',
                    WebkitTextStroke:
                      attrConfig.strokeWidthPx && attrConfig.strokeWidthPx > 0
                        ? `${attrConfig.strokeWidthPx}px ${attrConfig.strokeColor || '#000000'}`
                        : 'none',
                    paintOrder:
                      attrConfig.strokeWidthPx && attrConfig.strokeWidthPx > 0
                        ? 'stroke fill'
                        : 'normal',
                    transform: `translate(${attrConfig.textOffsetX || 0}px, ${
                      attrConfig.textOffsetY || 0
                    }px)`,
                  }}
                  className="absolute inset-0 flex items-center justify-center font-bold pointer-events-none select-none leading-none tracking-tight"
                >
                  {displayValue}
                </div>
              </div>
            );
          })()}

          {/* CAMADA 4B: THRESHOLD (SITE: LIVRE POSICIONAMENTO X/Y; DEMAIS TIPOS: FIXO/AO LADO DA MANA) */}
          {(() => {
            const effectiveAttribute =
              selectedAttribute ||
              (frameConfig?.imageUrl ? findAttributeByFrameUrl(frameConfig.imageUrl, cardType)?.id : undefined);
            const allowedThresholdElements = getAllowedThresholdElements(effectiveAttribute, cardType);

            if (
              cardType === 'avatar' ||
              allowedThresholdElements.length === 0 ||
              !sorceryConfig?.threshold ||
              !(sorceryConfig.threshold.isVisible ?? true)
            ) {
              return null;
            }

            const dist = computeThresholdDistribution(
              sorceryConfig.threshold,
              sorceryConfig.mana,
              allowedThresholdElements,
              cardType
            );

            if (dist.items.length === 0) return null;

            // Exclusivo para cartas Site: container posicionável e arrastável livremente em X e Y
            if (cardType === 'site') {
              const isThresholdSelected = isEditMode && selectedBoxId === 'site-threshold';
              const symWidth = sorceryConfig.threshold.symbolWidthPercent * (sorceryConfig.threshold.scale || 1);
              const gapX = (sorceryConfig.threshold.gapXPercent / 100) * symWidth;
              const symHeight = sorceryConfig.threshold.symbolHeightPercent * (sorceryConfig.threshold.scale || 1);
              const totalW = Math.max(dist.bounds.widthPercent, symWidth);
              const totalH = Math.max(dist.bounds.heightPercent, symHeight);
              const containerLeft = dist.bounds.startXPercent;

              return (
                <div
                  key="site-threshold-free-container"
                  onClick={(e) => {
                    if (!isEditMode) return;
                    e.stopPropagation();
                    onSelectBox('site-threshold');
                  }}
                  onPointerDown={(e) => {
                    if (!isEditMode) return;
                    handleStartMoveSiteThreshold(e, dist.bounds);
                  }}
                  style={{
                    position: 'absolute',
                    left: `${containerLeft}%`,
                    top: `${sorceryConfig.threshold.yPercent}%`,
                    width: `${totalW}%`,
                    height: `${totalH}%`,
                    zIndex: sorceryConfig.threshold.zIndex || 55,
                    opacity: sorceryConfig.threshold.opacity ?? 1,
                    cursor: isEditMode ? 'grab' : 'default',
                  }}
                  className={`group select-none ${
                    isThresholdSelected
                      ? 'ring-2 ring-[#C5A675] shadow-lg'
                      : isEditMode
                      ? 'hover:ring-1 hover:ring-[#C5A675]/60'
                      : ''
                  }`}
                  title={`Thresholds do Site: ${sorceryConfig.threshold.xPercent.toFixed(1)}% · ${sorceryConfig.threshold.yPercent.toFixed(1)}%`}
                >
                  {/* Handle no Modo de Edição */}
                  {isEditMode && (
                    <div
                      className={`absolute -top-4 right-0 h-4 px-1.5 flex items-center gap-1 text-[8px] font-mono rounded-t transition-opacity pointer-events-none ${
                        isThresholdSelected
                          ? 'bg-[#C5A675] text-[#1C1A17] font-bold opacity-100'
                          : 'bg-[#302D27] text-[#E8DECA] opacity-0 group-hover:opacity-90'
                      }`}
                    >
                      <span>Thresholds</span>
                      <span>X: {sorceryConfig.threshold.xPercent.toFixed(1)}% · Y: {sorceryConfig.threshold.yPercent.toFixed(1)}%</span>
                    </div>
                  )}

                  {/* Símbolos em linha horizontal da direita para a esquerda */}
                  {dist.items.map((item, idx) => {
                    const relLeftPercent = totalW > 0 ? ((item.xPercent - containerLeft) / totalW) * 100 : 0;
                    const relWidthPercent = totalW > 0 ? (symWidth / totalW) * 100 : 100;

                    return (
                      <div
                        key={`site-threshold-${item.index}-${item.element}`}
                        style={{
                          position: 'absolute',
                          left: `${relLeftPercent}%`,
                          top: '0%',
                          width: `${relWidthPercent}%`,
                          height: '100%',
                          zIndex: 50 + idx,
                        }}
                        className="flex items-center justify-center overflow-visible pointer-events-none select-none"
                      >
                        <img
                          src={getThresholdElementImagePath(
                            item.element,
                            sorceryConfig.threshold.elementImages
                          )}
                          alt={`Threshold ${item.element}`}
                          style={{
                            objectFit: sorceryConfig.threshold.keepAspectRatio ? 'contain' : 'fill',
                          }}
                          className="w-full h-full object-contain drop-shadow"
                        />
                      </div>
                    );
                  })}
                </div>
              );
            }

            // Demais tipos de carta (Minion, etc.): comportamento original mantido 100% intacto
            return (
              <div
                style={{
                  zIndex: sorceryConfig.threshold.zIndex || 50,
                  opacity: sorceryConfig.threshold.opacity,
                }}
                className="absolute inset-0 pointer-events-none select-none overflow-visible"
              >
                {dist.items.map((item) => (
                  <div
                    key={`threshold-${item.index}-${item.element}`}
                    style={{
                      left: `${item.xPercent}%`,
                      top: `${item.yPercent}%`,
                      width: `${sorceryConfig.threshold.symbolWidthPercent * (sorceryConfig.threshold.scale || 1)}%`,
                      height: `${sorceryConfig.threshold.symbolHeightPercent * (sorceryConfig.threshold.scale || 1)}%`,
                      zIndex: 50 + item.col,
                    }}
                    className="absolute pointer-events-none select-none flex items-center justify-center overflow-visible"
                  >
                    <img
                      src={getThresholdElementImagePath(
                        item.element,
                        sorceryConfig.threshold.elementImages
                      )}
                      alt={`Threshold ${item.element}`}
                      style={{
                        objectFit: sorceryConfig.threshold.keepAspectRatio ? 'contain' : 'fill',
                      }}
                      className="w-full h-full object-contain drop-shadow"
                    />
                  </div>
                ))}
              </div>
            );
          })()}

          {/* CAMADA 4C: INDICADOR DE COMBATE SORCERY (SELEÇÃO EXCLUSIVA ENTRE BLOCO A E BLOCO B) */}
          {hasCombatAttributes(cardType) &&
            sorceryConfig?.combat &&
            sorceryConfig.combat.isVisible &&
            (cardType !== 'site' || sorceryConfig.combat.siteCombatOption !== 'none') &&
            (() => {
            const combat = sorceryConfig.combat;
            const isSelected = !!isCombatSelected;
            const isSingle = combat.selectedType === 'attack-only';

            if (isSingle) {
              const single = combat.single;
              if (!single || single.value === undefined || single.value === null || String(single.value).trim() === '') {
                return null;
              }

              const atkFont = getFontCssProperties(single.style.fontFamily);
              const anchorX = single.attackXPercent ?? (single.numberAnchor?.xPercent ?? 50.0);
              const anchorY = single.attackYPercent ?? (single.numberAnchor?.yPercent ?? 50.0);

              return (
                <div
                  key="sorcery-combat-single"
                  onClick={(e) => {
                    if (!isEditMode) return;
                    e.stopPropagation();
                    onSelectBox(null);
                    onSelectCombat?.();
                  }}
                  onPointerDown={(e) => {
                    if (!isEditMode) return;
                    handleStartMoveCombat(e);
                  }}
                  style={{
                    left: `${single.xPercent}%`,
                    top: `${single.yPercent}%`,
                    width: `${single.widthPercent}%`,
                    height: `${single.heightPercent}%`,
                    opacity: single.opacity,
                    zIndex: single.zIndex || 60,
                    transform: `scale(${single.scale || 1})`,
                    transformOrigin: 'center center',
                  }}
                  className={`absolute group cursor-pointer transition-shadow ${
                    isSelected && isEditMode
                      ? 'ring-2 ring-rose-500 ring-offset-1 shadow-lg'
                      : isEditMode
                      ? 'hover:ring-1 hover:ring-rose-300 cursor-grab active:cursor-grabbing'
                      : ''
                  }`}
                  title={`${cardType === 'avatar' ? 'Ataque do Avatar' : 'Criatura com Ataque'}: ${single.value}`}
                >
                  {/* Imagem de Fundo Exclusiva do Bloco A */}
                  {single.imageUrl && (
                    <img
                      src={single.imageUrl}
                      alt="Ataque"
                      style={{
                        objectFit: single.keepAspectRatio ? 'contain' : 'fill',
                      }}
                      className="w-full h-full pointer-events-none select-none"
                    />
                  )}

                  {/* Elemento / Ícone Opcional de Ataque */}
                  {single.attackImageUrl && (
                    <img
                      src={single.attackImageUrl}
                      alt="Ícone de Ataque"
                      style={{
                        left: `${anchorX}%`,
                        top: `${anchorY}%`,
                        transform: `translate(-50%, -50%) translate(${single.style.offsetX || 0}px, ${single.style.offsetY || 0}px)`,
                      }}
                      className="absolute pointer-events-none select-none object-contain"
                    />
                  )}

                  {/* Valor de Ataque (Aceita números e *) */}
                  <div
                    style={{
                      left: `${anchorX}%`,
                      top: `${anchorY}%`,
                      transform: `translate(-50%, -50%) translate(${single.style.offsetX || 0}px, ${single.style.offsetY || 0}px)`,
                      fontFamily: atkFont.fontFamily,
                      fontSize: `${single.style.fontSizePx || 22}px`,
                      color: single.style.fontColor || '#ffffff',
                      fontWeight: single.style.fontWeight || 'bold',
                      fontStyle: single.style.fontStyle || 'normal',
                      textAlign: single.style.textAlign || 'center',
                      WebkitTextStroke:
                        single.style.strokeWidthPx && single.style.strokeWidthPx > 0
                          ? `${single.style.strokeWidthPx}px ${single.style.strokeColor || '#000000'}`
                          : 'none',
                      paintOrder:
                        single.style.strokeWidthPx && single.style.strokeWidthPx > 0
                          ? 'stroke fill'
                          : 'normal',
                    }}
                    className="absolute pointer-events-none select-none leading-none tracking-tight whitespace-nowrap"
                  >
                    {single.value}
                  </div>

                  {/* Controles de Arraste em Modo Edição */}
                  {isEditMode && (
                    <>
                      <div
                        onPointerDown={handleStartMoveCombat}
                        className={`absolute -top-4 left-0 right-0 h-4 px-1 flex items-center justify-between text-[8px] font-mono rounded-t transition-opacity ${
                          isSelected
                            ? 'bg-rose-600 text-white opacity-100'
                            : 'bg-slate-700 text-slate-200 opacity-0 group-hover:opacity-90'
                        } cursor-move`}
                      >
                        <span className="truncate max-w-[80px] font-sans font-semibold">
                          Ataque
                        </span>
                        <span className="text-[7px] opacity-80">
                          {Math.round(single.xPercent)}%
                        </span>
                      </div>

                      <div
                        onPointerDown={handleStartResizeCombat}
                        title="Arraste para redimensionar"
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-sm border border-white cursor-nwse-resize shadow-xs flex items-center justify-center z-30 transition-opacity ${
                          isSelected
                            ? 'bg-rose-600 opacity-100'
                            : 'bg-slate-700 opacity-0 group-hover:opacity-80'
                        }`}
                      >
                        <div className="w-1.5 h-1.5 border-r border-b border-white" />
                      </div>
                    </>
                  )}
                </div>
              );
            }

            // Bloco B: Criatura com Ataque e Defesa
            const dual = combat.dual;
            const hasAtk = dual?.attackValue !== undefined && dual?.attackValue !== null && String(dual.attackValue).trim() !== '';
            const hasDef = dual?.defenseValue !== undefined && dual?.defenseValue !== null && String(dual.defenseValue).trim() !== '';

            if (!dual || (!hasAtk && !hasDef)) {
              return null;
            }

            const atkFont = getFontCssProperties(dual.attackStyle.fontFamily);
            const defFont = getFontCssProperties(dual.defenseStyle.fontFamily);

            return (
              <div
                key="sorcery-combat-dual"
                onClick={(e) => {
                  if (!isEditMode) return;
                  e.stopPropagation();
                  onSelectBox(null);
                  onSelectCombat?.();
                }}
                onPointerDown={(e) => {
                  if (!isEditMode) return;
                  handleStartMoveCombat(e);
                }}
                style={{
                  left: `${dual.xPercent}%`,
                  top: `${dual.yPercent}%`,
                  width: `${dual.widthPercent}%`,
                  height: `${dual.heightPercent}%`,
                  opacity: dual.opacity,
                  zIndex: dual.zIndex || 60,
                  transform: `scale(${dual.scale || 1})`,
                  transformOrigin: 'center center',
                }}
                className={`absolute group cursor-pointer transition-shadow ${
                  isSelected && isEditMode
                    ? 'ring-2 ring-indigo-500 ring-offset-1 shadow-lg'
                    : isEditMode
                    ? 'hover:ring-1 hover:ring-indigo-300 cursor-grab active:cursor-grabbing'
                    : ''
                }`}
                title={`Criatura com Ataque e Defesa (Atk: ${dual.attackValue} | Def: ${dual.defenseValue})`}
              >
                {/* Imagem de Fundo Exclusiva do Bloco B */}
                {dual.backgroundImageUrl && (
                  <img
                    src={dual.backgroundImageUrl}
                    alt="Ataque e Defesa"
                    style={{
                      objectFit: dual.keepAspectRatio ? 'contain' : 'fill',
                    }}
                    className="w-full h-full pointer-events-none select-none"
                  />
                )}

                {/* Elemento / Ícone Independente de Ataque */}
                {dual.attackImageUrl && (
                  <img
                    src={dual.attackImageUrl}
                    alt="Ícone Ataque"
                    style={{
                      left: `${dual.attackXPercent}%`,
                      top: `${dual.attackYPercent}%`,
                      transform: `translate(-50%, -50%) translate(${dual.attackStyle.offsetX || 0}px, ${dual.attackStyle.offsetY || 0}px)`,
                    }}
                    className="absolute pointer-events-none select-none object-contain"
                  />
                )}

                {/* Valor de Ataque (Bloco B) */}
                {hasAtk && (
                  <div
                    style={{
                      left: `${dual.attackXPercent}%`,
                      top: `${dual.attackYPercent}%`,
                      transform: `translate(-50%, -50%) translate(${dual.attackStyle.offsetX || 0}px, ${dual.attackStyle.offsetY || 0}px)`,
                      fontFamily: atkFont.fontFamily,
                      fontSize: `${dual.attackStyle.fontSizePx || 22}px`,
                      color: dual.attackStyle.fontColor || '#ffffff',
                      fontWeight: dual.attackStyle.fontWeight || 'bold',
                      fontStyle: dual.attackStyle.fontStyle || 'normal',
                      textAlign: dual.attackStyle.textAlign || 'center',
                      WebkitTextStroke:
                        dual.attackStyle.strokeWidthPx && dual.attackStyle.strokeWidthPx > 0
                          ? `${dual.attackStyle.strokeWidthPx}px ${dual.attackStyle.strokeColor || '#000000'}`
                          : 'none',
                      paintOrder:
                        dual.attackStyle.strokeWidthPx && dual.attackStyle.strokeWidthPx > 0
                          ? 'stroke fill'
                          : 'normal',
                    }}
                    className="absolute pointer-events-none select-none leading-none tracking-tight whitespace-nowrap"
                    title={`Ataque: ${dual.attackValue}`}
                  >
                    {dual.attackValue}
                  </div>
                )}

                {/* Elemento / Ícone Independente de Defesa */}
                {dual.defenseImageUrl && (
                  <img
                    src={dual.defenseImageUrl}
                    alt="Ícone Defesa"
                    style={{
                      left: `${dual.defenseXPercent}%`,
                      top: `${dual.defenseYPercent}%`,
                      transform: `translate(-50%, -50%) translate(${dual.defenseStyle.offsetX || 0}px, ${dual.defenseStyle.offsetY || 0}px)`,
                    }}
                    className="absolute pointer-events-none select-none object-contain"
                  />
                )}

                {/* Valor de Defesa (Bloco B - Posicionamento totalmente independente) */}
                {hasDef && (
                  <div
                    style={{
                      left: `${dual.defenseXPercent}%`,
                      top: `${dual.defenseYPercent}%`,
                      transform: `translate(-50%, -50%) translate(${dual.defenseStyle.offsetX || 0}px, ${dual.defenseStyle.offsetY || 0}px)`,
                      fontFamily: defFont.fontFamily,
                      fontSize: `${dual.defenseStyle.fontSizePx || 22}px`,
                      color: dual.defenseStyle.fontColor || '#ffffff',
                      fontWeight: dual.defenseStyle.fontWeight || 'bold',
                      fontStyle: dual.defenseStyle.fontStyle || 'normal',
                      textAlign: dual.defenseStyle.textAlign || 'center',
                      WebkitTextStroke:
                        dual.defenseStyle.strokeWidthPx && dual.defenseStyle.strokeWidthPx > 0
                          ? `${dual.defenseStyle.strokeWidthPx}px ${dual.defenseStyle.strokeColor || '#000000'}`
                          : 'none',
                      paintOrder:
                        dual.defenseStyle.strokeWidthPx && dual.defenseStyle.strokeWidthPx > 0
                          ? 'stroke fill'
                          : 'normal',
                    }}
                    className="absolute pointer-events-none select-none leading-none tracking-tight whitespace-nowrap"
                    title={`Defesa: ${dual.defenseValue}`}
                  >
                    {dual.defenseValue}
                  </div>
                )}

                {/* Controles de Arraste em Modo Edição */}
                {isEditMode && (
                  <>
                    <div
                      onPointerDown={handleStartMoveCombat}
                      className={`absolute -top-4 left-0 right-0 h-4 px-1 flex items-center justify-between text-[8px] font-mono rounded-t transition-opacity ${
                        isSelected
                          ? 'bg-indigo-600 text-white opacity-100'
                          : 'bg-slate-700 text-slate-200 opacity-0 group-hover:opacity-90'
                      } cursor-move`}
                    >
                      <span className="truncate max-w-[80px] font-sans font-semibold">
                        Atk & Def
                      </span>
                      <span className="text-[7px] opacity-80">
                        {Math.round(dual.xPercent)}%
                      </span>
                    </div>

                    <div
                      onPointerDown={handleStartResizeCombat}
                      title="Arraste para redimensionar"
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-sm border border-white cursor-nwse-resize shadow-xs flex items-center justify-center z-30 transition-opacity ${
                        isSelected
                          ? 'bg-indigo-600 opacity-100'
                          : 'bg-slate-700 opacity-0 group-hover:opacity-80'
                      }`}
                    >
                      <div className="w-1.5 h-1.5 border-r border-b border-white" />
                    </div>
                  </>
                )}
              </div>
            );
          })()}

          {/* CAMADA 5A: TÍTULO COMPOSTO EXCLUSIVO PARA O TIPO SITE (NOME + TIPO/SUBTIPO) */}
          {cardType === 'site' && (() => {
            const titleBox = textBoxes.find((b) => b.role === 'title') || textBoxes.find((b) => b.id === 'box-title');
            const typeBox = textBoxes.find((b) => b.role === 'type') || textBoxes.find((b) => b.id === 'box-type');

            if (!titleBox || !titleBox.isVisible) return null;

            return (
              <SiteCompositeTitle
                key="site-composite-title"
                titleBox={titleBox}
                typeBox={typeBox}
                isEditMode={isEditMode}
                isSelected={selectedBoxId === titleBox.id || selectedBoxId === typeBox?.id}
                baseWidth={baseWidth}
                baseHeight={baseHeight}
                onSelect={() => {
                  onSelectSymbol?.(null);
                  onSelectBox(titleBox.id);
                }}
                onStartMove={(e) => handleStartMoveBox(e, titleBox)}
                onStartResize={(e) => handleStartResizeBox(e, titleBox)}
              />
            );
          })()}

          {/* CAMADA 5: CAIXAS DE TEXTO DINÂMICAS E POSICIONÁVEIS COM ESPAÇAMENTOS AVANÇADOS, AUTO FIT E ALINHAMENTO INDIVIDUAL */}
          {textBoxes.map((box) => {
            if (!box.isVisible) return null;
            // No tipo Site, o título e tipo/subtipo são gerenciados exclusivamente pelo SiteCompositeTitle
            if (cardType === 'site' && (box.role === 'title' || box.role === 'type' || box.id === 'box-title' || box.id === 'box-type')) {
              return null;
            }
            const isSelected = selectedBoxId === box.id;
            const fontCss = getFontCssProperties(box.fontFamily);

            const effectiveLineHeight = box.lineHeight !== undefined ? box.lineHeight : 1.25;
            const letterSpace = `${box.letterSpacingPx || 0}px`;
            const wordSpace = `${box.wordSpacingPx || 0}px`;

            // Cálculo do Auto Fit (Redução proporcional e aviso de overflow)
            const fitResult = calculateAutoFitFontSize(box, baseWidth, baseHeight);
            const effectiveFontSize = fitResult.effectiveFontSizePx;
            const isOverflowing = fitResult.isOverflowing;

            // Margens internas (padding) horizontal e vertical independentes
            const padX = box.paddingXPx !== undefined ? box.paddingXPx : (box.paddingPx ?? 0);
            const padY = box.paddingYPx !== undefined ? box.paddingYPx : (box.paddingPx ?? 0);

            const hasTextStroke = Boolean(box.textStrokeEnabled && (box.textStrokeWidthPx ?? 0) > 0);
            const textStrokeStyle: React.CSSProperties = hasTextStroke
              ? {
                  WebkitTextStroke: `${box.textStrokeWidthPx}px ${box.textStrokeColor || '#000000'}`,
                  paintOrder: 'stroke fill',
                }
              : {};

            const isEditingThisBox = editingBoxId === box.id;

            return (
              <div
                key={box.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectSymbol?.(null);
                  onSelectBox(box.id);
                }}
                onDoubleClick={(e) => {
                  e.stopPropagation();
                  if (isEditMode) {
                    setEditingBoxId(box.id);
                  }
                }}
                style={{
                  left: `${box.xPercent}%`,
                  top: `${box.yPercent}%`,
                  width: `${box.widthPercent}%`,
                  minHeight: box.heightPercent ? `${box.heightPercent}%` : undefined,
                  backgroundColor: box.bgColor,
                  color: box.textColor,
                  fontSize: `${effectiveFontSize}px`,
                  fontWeight: box.fontWeight,
                  fontFamily: fontCss.fontFamily,
                  fontStyle: fontCss.fontStyle,
                  textAlign: box.textAlign,
                  letterSpacing: letterSpace,
                  wordSpacing: wordSpace,
                  lineHeight: effectiveLineHeight,
                  borderRadius: `${box.borderRadiusPx}px`,
                  border:
                    box.borderWidthPx > 0
                      ? `${box.borderWidthPx}px solid ${box.borderColor}`
                      : 'none',
                  padding: `${padY}px ${padX}px`,
                  ...textStrokeStyle,
                }}
                className={`absolute z-30 transition-shadow group ${
                  isSelected && isEditMode
                    ? isOverflowing
                      ? 'ring-2 ring-amber-500 ring-offset-1 shadow-lg'
                      : 'ring-2 ring-blue-500 ring-offset-1 shadow-lg'
                    : isEditMode
                    ? 'hover:ring-1 hover:ring-slate-400 cursor-grab active:cursor-grabbing'
                    : ''
                }`}
              >
                {/* Cabeçalho / Handle de Arraste (Visível quando em modo de edição) */}
                {isEditMode && (
                  <div
                    onPointerDown={(e) => handleStartMoveBox(e, box)}
                    className={`absolute -top-5 left-0 right-0 h-5 px-1.5 flex items-center justify-between text-[9px] font-mono rounded-t transition-opacity ${
                      isSelected
                        ? isOverflowing
                          ? 'bg-amber-600 text-white opacity-100'
                          : 'bg-blue-600 text-white opacity-100'
                        : 'bg-slate-700 text-slate-200 opacity-0 group-hover:opacity-90'
                    } cursor-move`}
                  >
                    <div className="flex items-center gap-1 truncate max-w-[140px]">
                      <span className="font-sans font-semibold truncate">
                        {box.name}
                      </span>
                      {isOverflowing && (
                        <span
                          title="Aviso: texto excede os limites da caixa mesmo no tamanho mínimo!"
                          className="bg-red-500 text-white text-[8px] px-1 py-0.2 rounded font-bold shrink-0 flex items-center gap-0.5"
                        >
                          <AlertTriangle className="w-2.5 h-2.5" /> Excede
                        </span>
                      )}
                      {fitResult.isReduced && !isOverflowing && (
                        <span
                          title={`Auto Fit: ajustado para ${effectiveFontSize.toFixed(1)}px`}
                          className="bg-blue-800 text-white text-[8px] px-1 py-0.2 rounded font-bold shrink-0"
                        >
                          Fit {effectiveFontSize.toFixed(0)}px
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[8px] opacity-80">
                        {box.xPercent}% · {box.yPercent}%
                      </span>
                      <Move className="w-2.5 h-2.5" />
                    </div>
                  </div>
                )}

                {/* Conteúdo do Texto com Parágrafos Formatados e Alinhamento Individual */}
                {box.isMultiline ? (
                  isEditingThisBox ? (
                    <textarea
                      autoFocus
                      value={box.content}
                      onChange={(e) => onUpdateTextBox(box.id, { content: e.target.value })}
                      onBlur={() => setEditingBoxId(null)}
                      rows={3}
                      placeholder="Digite o texto aqui..."
                      className="w-full bg-transparent resize-none border-none outline-none overflow-hidden p-0 m-0 box-border leading-[inherit]"
                      style={{
                        color: box.textColor,
                        fontSize: `${effectiveFontSize}px`,
                        fontWeight: box.fontWeight,
                        fontFamily: fontCss.fontFamily,
                        fontStyle: fontCss.fontStyle,
                        textAlign: box.textAlign,
                        letterSpacing: letterSpace,
                        wordSpacing: wordSpace,
                        lineHeight: effectiveLineHeight,
                        ...textStrokeStyle,
                      }}
                    />
                  ) : (
                    <div className="w-full m-0 p-0">
                      {box.content.split(/\r?\n/).map((para, idx, arr) => {
                        const pAlign = cardType === 'site'
                          ? (box.textAlign || 'left')
                          : ((box.paragraphAlignments && box.paragraphAlignments[idx]) || box.textAlign || 'left');
                        return (
                          <p
                            key={idx}
                            className="m-0 p-0 leading-[inherit]"
                            style={{
                              margin: 0,
                              padding: 0,
                              textAlign: pAlign,
                              marginBottom:
                                idx < arr.length - 1
                                   ? `${box.paragraphSpacingPx !== undefined ? box.paragraphSpacingPx : 4}px`
                                  : '0px',
                              ...textStrokeStyle,
                            }}
                          >
                            {para ? renderFormattedTextWithSymbols(para, `para-${box.id}-${idx}`) : '\u00A0'}
                          </p>
                        );
                      })}
                    </div>
                  )
                ) : (
                  isEditingThisBox ? (
                    <input
                      autoFocus
                      type="text"
                      value={box.content}
                      onChange={(e) => onUpdateTextBox(box.id, { content: e.target.value })}
                      onBlur={() => setEditingBoxId(null)}
                      placeholder="Digite aqui..."
                      className="w-full bg-transparent border-none outline-none p-0 m-0 box-border leading-[inherit]"
                      style={{
                        color: box.textColor,
                        fontSize: `${effectiveFontSize}px`,
                        fontWeight: box.fontWeight,
                        fontFamily: fontCss.fontFamily,
                        fontStyle: fontCss.fontStyle,
                        textAlign: box.textAlign,
                        letterSpacing: letterSpace,
                        wordSpacing: wordSpace,
                        lineHeight: effectiveLineHeight,
                        ...textStrokeStyle,
                      }}
                    />
                  ) : (
                    <div
                      className="w-full m-0 p-0 truncate leading-[inherit]"
                      style={{
                        textAlign: cardType === 'site'
                          ? (box.textAlign || 'left')
                          : ((box.paragraphAlignments && box.paragraphAlignments[0]) || box.textAlign || 'left'),
                        ...textStrokeStyle,
                      }}
                    >
                      {box.content ? renderFormattedTextWithSymbols(box.content, `box-${box.id}`) : '\u00A0'}
                    </div>
                  )
                )}

                {/* Puxador de Redimensionamento no Canto Inferior Direito */}
                {isEditMode && isSelected && (
                  <div
                    onPointerDown={(e) => handleStartResizeBox(e, box)}
                    title="Arraste para redimensionar largura e altura"
                    className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-blue-600 border border-white rounded-sm cursor-nwse-resize shadow flex items-center justify-center z-30"
                  >
                    <div className="w-1.5 h-1.5 border-r border-b border-white" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Input oculto para carregar arquivo de imagem */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                onUploadImage(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>
        </div>
      </div>

      {/* Rótulo inferior de dimensões reais */}
      <div className="mt-4 text-xs text-slate-500 font-mono flex items-center gap-2">
        <span>Dimensões Físicas: {dimensions.widthMm}mm × {dimensions.heightMm}mm</span>
        <span aria-hidden="true">·</span>
        <span>Proporção: {dimensions.widthMm}:{dimensions.heightMm} (~{dimensions.aspectRatio.toFixed(3)})</span>
      </div>
    </div>
  );
};
